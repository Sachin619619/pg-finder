import { NextResponse } from "next/server";
import { listings } from "@/data/listings";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const API_URL = "https://api.minimax.io/v1/text/chatcompletion_v2";
const MODEL = "MiniMax-M2.7-highspeed";

const SYSTEM_PROMPT = `You are PG Finder AI — ultra concise assistant for PG accommodation in Bangalore.

STRICT RULES:
1. Reply in MAX 1 short sentence. No bullet points. No descriptions of individual PGs.
2. When showing PGs, write ONE line like "Found 3 PGs for you 🎯" then ALWAYS add RESULTS_JSON on a new line.
3. RESULTS_JSON must contain real PG IDs from the database below. Example: RESULTS_JSON:["pg-5","pg-12","pg-14"]
4. For actions, add ACTION_JSON on a new line. Example: ACTION_JSON:{"action":"navigate","data":{"url":"/saved"}}
5. NEVER describe PG details in text — the UI renders cards automatically.

ACTION TYPES:
- ACTION_JSON:{"action":"navigate","data":{"url":"/listing/pg-1"}} — open listing
- ACTION_JSON:{"action":"navigate","data":{"url":"/saved"}} — saved PGs
- ACTION_JSON:{"action":"navigate","data":{"url":"/roommate-finder"}} — roommates
- ACTION_JSON:{"action":"navigate","data":{"url":"/booking/pg-1"}} — book PG
- ACTION_JSON:{"action":"save","data":{"pgId":"pg-1"}} — save to favorites
- ACTION_JSON:{"action":"call","data":{"phone":"9876543210","name":"Owner"}} — call owner
- ACTION_JSON:{"action":"whatsapp","data":{"phone":"9876543210","pgName":"PG Name"}} — WhatsApp

EXAMPLES:
User: "PGs under 8000" → "Found 4 budget PGs under ₹8K 🏠" then RESULTS_JSON:["pg-4","pg-8","pg-14","pg-18"]
User: "Save Zolo Haven" → "Saved! ❤️" then ACTION_JSON:{"action":"save","data":{"pgId":"pg-5"}}
User: "Book CozyStay" → "Taking you to booking 🎉" then ACTION_JSON:{"action":"navigate","data":{"url":"/booking/pg-1"}}
User: "Call ORR Connect owner" → "Calling Naveen 📞" then ACTION_JSON:{"action":"call","data":{"phone":"9632587410","name":"Naveen"}}
User: "Show saved" → "Opening saved PGs ❤️" then ACTION_JSON:{"action":"navigate","data":{"url":"/saved"}}
User: "Find roommates" → "Let's find a roommate! 🤝" then ACTION_JSON:{"action":"navigate","data":{"url":"/roommate-finder"}}

PG DATABASE:
${JSON.stringify(listings.map(l => ({
  id: l.id, name: l.name, area: l.area, price: l.price,
  type: l.type, gender: l.gender, amenities: l.amenities, rating: l.rating,
  reviews: l.reviews, foodIncluded: l.foodIncluded, wifiIncluded: l.wifiIncluded,
  acAvailable: l.acAvailable, contactPhone: l.contactPhone, contactName: l.contactName,
  distanceFromMetro: l.distanceFromMetro,
})))}

CRITICAL: Always use REAL PG IDs from the database. Filter accurately by price, area, gender, amenities. Keep text to ONE sentence.`;

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

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
        temperature: 0.3,
        max_tokens: 2048,
      }),
    });

    const data = await response.json();

    if (data.base_resp?.status_code && data.base_resp.status_code !== 0) {
      console.error("MiniMax API error:", data.base_resp);
      return NextResponse.json({ error: data.base_resp.status_msg || "AI error" }, { status: 502 });
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, try again!";

    // Extract PG IDs — support multiple formats
    let matchedPGs: string[] = [];
    const resultsMatch = reply.match(/RESULTS_JSON:\s*(\[[\s\S]*?\])/);
    if (resultsMatch) {
      try { matchedPGs = JSON.parse(resultsMatch[1]); } catch {}
    }
    // Fallback: try ```json_results format
    if (matchedPGs.length === 0) {
      const altMatch = reply.match(/```json_results\s*(\[[\s\S]*?\])\s*```/);
      if (altMatch) {
        try { matchedPGs = JSON.parse(altMatch[1]); } catch {}
      }
    }

    // Extract action
    let action = null;
    const actionMatch = reply.match(/ACTION_JSON:\s*(\{[\s\S]*?\})/);
    if (actionMatch) {
      try { action = JSON.parse(actionMatch[1]); } catch {}
    }
    // Fallback
    if (!action) {
      const altAction = reply.match(/```json_actions\s*(\{[\s\S]*?\})\s*```/);
      if (altAction) {
        try { action = JSON.parse(altAction[1]); } catch {}
      }
    }

    // Clean reply — remove all JSON blocks
    const cleanReply = reply
      .replace(/RESULTS_JSON:\s*\[[\s\S]*?\]/g, "")
      .replace(/ACTION_JSON:\s*\{[\s\S]*?\}/g, "")
      .replace(/```json_results[\s\S]*?```/g, "")
      .replace(/```json_actions[\s\S]*?```/g, "")
      .replace(/---/g, "")
      .replace(/###\s*/g, "")
      .replace(/\*\*/g, "")
      .replace(/\n{2,}/g, "\n")
      .trim();

    // Get full listing data — only valid IDs
    const matchedListings = matchedPGs
      .map((id: string) => listings.find((l) => l.id === id))
      .filter(Boolean);

    return NextResponse.json({
      reply: cleanReply,
      listings: matchedListings,
      action,
    });
  } catch (error) {
    console.error("AI Agent error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
