import { NextResponse } from "next/server";
import { listings } from "@/data/listings";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const API_URL = "https://api.minimax.io/v1/text/chatcompletion_v2";
const MODEL = "MiniMax-M2.7-highspeed";

// Build compact PG data string
const pgData = listings.map(l =>
  `${l.id}|${l.name}|${l.area}|₹${l.price}|${l.type}|${l.gender}|${l.amenities.join(",")}|${l.rating}⭐|${l.contactName}|${l.contactPhone}|food:${l.foodIncluded}|wifi:${l.wifiIncluded}|ac:${l.acAvailable}|metro:${l.distanceFromMetro || "N/A"}`
).join("\n");

const SYSTEM_PROMPT = `You are PG Finder AI for Bangalore. You help users find, save, book PGs.

PG DATABASE (id|name|area|price|roomType|gender|amenities|rating|ownerName|ownerPhone|food|wifi|ac|metro):
${pgData}

RESPONSE FORMAT — you MUST follow this EXACTLY:
1. Write ONE short sentence (max 15 words)
2. On the NEXT LINE, write RESULTS_JSON: followed by matching PG ID array
3. If user wants an action, write ACTION_JSON: followed by the action object

EXAMPLE RESPONSES:

User: "PGs under 8000"
Assistant:
Found 4 budget PGs under ₹8K 🏠
RESULTS_JSON:["pg-4","pg-8","pg-14","pg-18"]

User: "Female PGs with food"
Assistant:
Here are female PGs with meals included 🍽️
RESULTS_JSON:["pg-9","pg-11"]

User: "Save Zolo Haven"
Assistant:
Saved Zolo Haven! ❤️
ACTION_JSON:{"action":"save","data":{"pgId":"pg-5"}}

User: "Book CozyStay"
Assistant:
Opening booking for CozyStay 🎉
ACTION_JSON:{"action":"navigate","data":{"url":"/booking/pg-1"}}

User: "Call ORR Connect owner"
Assistant:
Calling Naveen 📞
ACTION_JSON:{"action":"call","data":{"phone":"9632587410","name":"Naveen"}}

User: "WhatsApp Zolo Haven owner"
Assistant:
Opening WhatsApp for Priya 💬
ACTION_JSON:{"action":"whatsapp","data":{"phone":"9845612370","pgName":"Zolo Haven"}}

User: "Show saved PGs"
Assistant:
Opening your saved PGs ❤️
ACTION_JSON:{"action":"navigate","data":{"url":"/saved"}}

User: "Find roommates"
Assistant:
Let's find you a roommate! 🤝
ACTION_JSON:{"action":"navigate","data":{"url":"/roommate-finder"}}

CRITICAL RULES:
- ALWAYS include RESULTS_JSON with real PG IDs when recommending PGs
- Filter PGs accurately by price, area, gender, amenities from the database
- Keep text to ONE sentence, never describe individual PGs
- The UI will render PG cards automatically from the IDs you provide`;

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
    console.log("Raw AI reply:", reply);

    // Extract PG IDs — handle both quoted and unquoted formats
    let matchedPGs: string[] = [];
    const resultsMatch = reply.match(/RESULTS_JSON:\s*\[([^\]]*)\]/);
    if (resultsMatch) {
      const raw = resultsMatch[1];
      // Try JSON parse first (quoted IDs)
      try {
        matchedPGs = JSON.parse(`[${raw}]`);
      } catch {
        // Fallback: extract pg-XX patterns from unquoted list
        const idMatches = raw.match(/pg-\d+/g);
        if (idMatches) matchedPGs = idMatches;
      }
    }

    // Extract action
    let action = null;
    const actionMatch = reply.match(/ACTION_JSON:\s*(\{[^\n]*\})/);
    if (actionMatch) {
      try { action = JSON.parse(actionMatch[1]); } catch {}
    }

    // Clean reply — remove JSON lines
    const cleanReply = reply
      .replace(/RESULTS_JSON:\s*\[[^\]]*\]/g, "")
      .replace(/ACTION_JSON:\s*\{[^\n]*\}/g, "")
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
