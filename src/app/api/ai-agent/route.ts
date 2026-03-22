import { NextResponse } from "next/server";
import { listings, type PGListing } from "@/data/listings";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const API_URL = "https://api.minimax.io/v1/text/chatcompletion_v2";
const MODEL = "MiniMax-M2.7-highspeed";

const SYSTEM_PROMPT = `You are PG Finder AI for Bangalore. You parse user intent and return structured JSON.

ALWAYS respond in this EXACT format — nothing else:
{"intent":"INTENT","text":"short 1-line reply","filters":{"area":"","maxPrice":0,"minPrice":0,"gender":"","amenities":[],"type":"","food":false,"wifi":false,"ac":false},"action":null}

INTENTS:
- "search" — user wants to find/browse PGs. Fill filters object.
- "action" — user wants to save/book/call/navigate. Fill action object.
- "chat" — general question, no PG search needed.

For "action" intent, set action to one of:
{"type":"save","pgName":"..."}
{"type":"navigate","url":"/saved"}
{"type":"navigate","url":"/roommate-finder"}
{"type":"navigate","url":"/booking/PG_NAME"}
{"type":"call","pgName":"..."}
{"type":"whatsapp","pgName":"..."}

EXAMPLES:
User: "PGs under 8000" → {"intent":"search","text":"Budget PGs under ₹8K 🏠","filters":{"maxPrice":8000},"action":null}
User: "Female PGs in Koramangala with food" → {"intent":"search","text":"Female PGs in Koramangala with meals 🍽️","filters":{"area":"Koramangala","gender":"female","food":true},"action":null}
User: "Show saved" → {"intent":"action","text":"Opening saved PGs ❤️","filters":{},"action":{"type":"navigate","url":"/saved"}}
User: "Call Zolo Haven owner" → {"intent":"action","text":"Calling Zolo Haven owner 📞","filters":{},"action":{"type":"call","pgName":"Zolo Haven"}}
User: "What areas are good for IT workers?" → {"intent":"chat","text":"Whitefield, Bellandur, and Electronic City are top picks for IT professionals — close to tech parks with good PG options! 💻","filters":{},"action":null}

RULES:
- ONLY output valid JSON, nothing else
- "text" must be 1 short sentence (max 15 words)
- For filters, only include fields that user mentioned
- area values: Koramangala, HSR Layout, Indiranagar, Whitefield, etc.
- gender: male, female, coed
- type: single, double, triple`;

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

// Server-side PG filtering
function filterPGs(filters: Record<string, unknown>): PGListing[] {
  let results = [...listings];

  if (filters.area) {
    const area = (filters.area as string).toLowerCase();
    results = results.filter(pg => pg.area.toLowerCase().includes(area));
  }
  if (filters.maxPrice) {
    results = results.filter(pg => pg.price <= (filters.maxPrice as number));
  }
  if (filters.minPrice) {
    results = results.filter(pg => pg.price >= (filters.minPrice as number));
  }
  if (filters.gender) {
    const g = (filters.gender as string).toLowerCase();
    results = results.filter(pg => pg.gender === g || pg.gender === "coed");
  }
  if (filters.type) {
    results = results.filter(pg => pg.type === filters.type || pg.type === "any");
  }
  if (filters.food) {
    results = results.filter(pg => pg.foodIncluded);
  }
  if (filters.wifi) {
    results = results.filter(pg => pg.wifiIncluded);
  }
  if (filters.ac) {
    results = results.filter(pg => pg.acAvailable);
  }
  if (filters.amenities && Array.isArray(filters.amenities) && filters.amenities.length > 0) {
    results = results.filter(pg =>
      (filters.amenities as string[]).every(a =>
        pg.amenities.some(pa => pa.toLowerCase().includes(a.toLowerCase()))
      )
    );
  }

  // Sort by rating
  results.sort((a, b) => b.rating - a.rating);

  return results.slice(0, 8);
}

// Find PG by name for actions
function findPGByName(name: string): PGListing | undefined {
  const lower = name.toLowerCase();
  return listings.find(pg =>
    pg.name.toLowerCase().includes(lower) ||
    lower.includes(pg.name.toLowerCase().split(" ")[0])
  );
}

export async function POST(req: Request) {
  if (!MINIMAX_API_KEY) {
    return NextResponse.json({ error: "AI service not configured" }, { status: 500 });
  }

  try {
    const { messages } = (await req.json()) as { messages: Message[] };
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array required" }, { status: 400 });
    }

    const fullMessages: Message[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: fullMessages,
        temperature: 0.1,
        max_tokens: 512,
      }),
    });

    const data = await response.json();

    if (data.base_resp?.status_code && data.base_resp.status_code !== 0) {
      console.error("MiniMax error:", data.base_resp);
      return NextResponse.json({ error: data.base_resp.status_msg || "AI error" }, { status: 502 });
    }

    const rawReply = data.choices?.[0]?.message?.content || "";

    // Parse the JSON response from AI
    let parsed;
    try {
      // Extract JSON from response (handle markdown code blocks too)
      const jsonStr = rawReply.replace(/```json\s*/g, "").replace(/```/g, "").trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      // Fallback: try to find JSON in response
      const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try { parsed = JSON.parse(jsonMatch[0]); } catch {}
      }
    }

    if (!parsed) {
      // If AI didn't return JSON, just return text
      return NextResponse.json({
        reply: rawReply.slice(0, 200),
        listings: [],
        action: null,
      });
    }

    const replyText = parsed.text || "Here you go! 🎯";
    let matchedListings: PGListing[] = [];
    let action = null;

    if (parsed.intent === "search" && parsed.filters) {
      matchedListings = filterPGs(parsed.filters);
    }

    if (parsed.intent === "action" && parsed.action) {
      const act = parsed.action;
      if (act.type === "navigate") {
        action = { action: "navigate", data: { url: act.url } };
      } else if (act.type === "save" && act.pgName) {
        const pg = findPGByName(act.pgName);
        if (pg) action = { action: "save", data: { pgId: pg.id } };
      } else if (act.type === "call" && act.pgName) {
        const pg = findPGByName(act.pgName);
        if (pg) action = { action: "call", data: { phone: pg.contactPhone, name: pg.contactName } };
      } else if (act.type === "whatsapp" && act.pgName) {
        const pg = findPGByName(act.pgName);
        if (pg) action = { action: "whatsapp", data: { phone: pg.contactPhone, pgName: pg.name } };
      }
    }

    return NextResponse.json({
      reply: replyText,
      listings: matchedListings,
      action,
    });
  } catch (error) {
    console.error("AI Agent error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
