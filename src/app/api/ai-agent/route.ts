import { NextResponse } from "next/server";
import { listings } from "@/data/listings";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const API_URL = "https://api.minimax.io/v1/text/chatcompletion_v2";
const MODEL = "MiniMax-M2.7-highspeed";

// Compact PG data
const pgData = listings.map(l =>
  `${l.id}|${l.name}|${l.area}|₹${l.price}|${l.type}|${l.gender}|${l.amenities.join(",")}|${l.rating}★|${l.contactName}|${l.contactPhone}|food:${l.foodIncluded ? "Y" : "N"}|wifi:${l.wifiIncluded ? "Y" : "N"}|ac:${l.acAvailable ? "Y" : "N"}`
).join("\n");

// Keep system prompt SHORT so model follows format
const SYSTEM_PROMPT = `You are PG Finder AI for Bangalore. Ultra concise.

RULES:
1. Write MAX 1 sentence (under 15 words)
2. When recommending PGs, ALWAYS add on next line: RESULTS_JSON:["pg-1","pg-5"]
3. For actions add: ACTION_JSON:{"action":"save","data":{"pgId":"pg-1"}}
4. NEVER describe individual PGs in text — UI renders cards automatically
5. Use REAL PG IDs from the database provided

Actions: navigate (url), save (pgId), call (phone,name), whatsapp (phone,pgName)
Nav URLs: /saved, /roommate-finder, /booking/PG_ID, /listing/PG_ID`;

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

    // Inject PG database as context in first user message
    const firstUserIdx = messages.findIndex(m => m.role === "user");
    const messagesWithData = messages.map((m, i) => {
      if (i === firstUserIdx) {
        return {
          ...m,
          content: `[PG DATABASE - use these IDs to answer]\n${pgData}\n\n[USER QUERY]: ${m.content}`,
        };
      }
      return m;
    });

    const fullMessages: Message[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messagesWithData,
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
        temperature: 0.2,
        max_tokens: 1024,
      }),
    });

    const data = await response.json();

    if (data.base_resp?.status_code && data.base_resp.status_code !== 0) {
      console.error("MiniMax error:", data.base_resp);
      return NextResponse.json({ error: data.base_resp.status_msg || "AI error" }, { status: 502 });
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, try again!";

    // Extract PG IDs — handle quoted, unquoted, and spaced formats
    let matchedPGs: string[] = [];
    const resultsMatch = reply.match(/RESULTS_JSON:\s*\[([^\]]*)\]/);
    if (resultsMatch) {
      const raw = resultsMatch[1];
      // Extract all pg-XX patterns regardless of format
      const idMatches = raw.match(/pg-\d+/g);
      if (idMatches) matchedPGs = idMatches;
    }

    // Extract action
    let action = null;
    const actionMatch = reply.match(/ACTION_JSON:\s*(\{[^\n]*\})/);
    if (actionMatch) {
      try { action = JSON.parse(actionMatch[1]); } catch {}
    }

    // Clean reply
    const cleanReply = reply
      .replace(/RESULTS_JSON:\s*\[[^\]]*\]/g, "")
      .replace(/ACTION_JSON:\s*\{[^\n]*\}/g, "")
      .replace(/\[PG DATABASE[\s\S]*?\[USER QUERY\]:\s*/g, "")
      .replace(/\n{2,}/g, "\n")
      .trim();

    // Get full listing data
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
