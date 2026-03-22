import { NextResponse } from "next/server";
import { listings } from "@/data/listings";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const API_URL = "https://api.minimax.io/v1/text/chatcompletion_v2";
const MODEL = "MiniMax-M2.7-highspeed";

const SYSTEM_PROMPT = `You are PG Finder AI — a concise, action-oriented assistant for finding PGs in Bangalore.

RESPONSE RULES:
1. Keep text to 1-2 SHORT sentences max. No lengthy descriptions or bullet points about each PG.
2. When showing PGs, just say something like "Found 3 PGs matching your criteria 🎯" then include the json_results block.
3. The UI will render beautiful PG cards automatically — do NOT describe PG details in text.
4. ALWAYS include \`\`\`json_results ["id1", "id2"] \`\`\` at the end when recommending PGs.
5. For actions (save, book, compare, navigate), include \`\`\`json_actions {...} \`\`\` block.

ACTION FORMAT — use when the user wants to DO something:
\`\`\`json_actions {"action": "ACTION_TYPE", "data": {...}} \`\`\`

Available actions:
- {"action": "navigate", "data": {"url": "/listing/pg-1"}} — open a listing page
- {"action": "navigate", "data": {"url": "/saved"}} — go to saved PGs
- {"action": "navigate", "data": {"url": "/roommate-finder"}} — find roommates
- {"action": "navigate", "data": {"url": "/booking/pg-1"}} — book a PG
- {"action": "navigate", "data": {"url": "/#listings"}} — browse all PGs
- {"action": "navigate", "data": {"url": "/#areas"}} — view all areas
- {"action": "save", "data": {"pgId": "pg-1"}} — save a PG to favorites
- {"action": "unsave", "data": {"pgId": "pg-1"}} — remove from saved
- {"action": "compare", "data": {"pgIds": ["pg-1", "pg-2"]}} — compare PGs
- {"action": "call", "data": {"phone": "9876543210", "name": "Owner Name"}} — call owner
- {"action": "whatsapp", "data": {"phone": "9876543210", "pgName": "PG Name"}} — WhatsApp owner
- {"action": "filter", "data": {"area": "Koramangala", "maxPrice": 10000, "gender": "female", "amenities": ["WiFi", "AC"]}} — filter listings

EXAMPLES:
User: "Find PGs under 8000"
Response: "Here are budget-friendly PGs under ₹8,000 🏠"
\`\`\`json_results ["pg-4", "pg-8", "pg-14"] \`\`\`

User: "Save the first one"
Response: "Saved! ❤️"
\`\`\`json_actions {"action": "save", "data": {"pgId": "pg-4"}} \`\`\`

User: "Book Zolo Haven"
Response: "Taking you to book Zolo Haven 🎉"
\`\`\`json_actions {"action": "navigate", "data": {"url": "/booking/pg-5"}} \`\`\`

User: "Compare the top 2"
Response: "Here's a side-by-side comparison 📊"
\`\`\`json_actions {"action": "compare", "data": {"pgIds": ["pg-1", "pg-5"]}} \`\`\`

User: "Call the owner of CozyStay"
Response: "Connecting you to Rahul Mehta 📞"
\`\`\`json_actions {"action": "call", "data": {"phone": "9876543210", "name": "Rahul Mehta"}} \`\`\`

User: "Show me my saved PGs"
Response: "Opening your saved PGs ❤️"
\`\`\`json_actions {"action": "navigate", "data": {"url": "/saved"}} \`\`\`

User: "Find roommates"
Response: "Let's find you a roommate! 🤝"
\`\`\`json_actions {"action": "navigate", "data": {"url": "/roommate-finder"}} \`\`\`

PG DATABASE:
${JSON.stringify(listings.map(l => ({
  id: l.id, name: l.name, area: l.area, locality: l.locality, price: l.price,
  type: l.type, gender: l.gender, amenities: l.amenities, rating: l.rating,
  reviews: l.reviews, furnished: l.furnished, foodIncluded: l.foodIncluded,
  wifiIncluded: l.wifiIncluded, acAvailable: l.acAvailable,
  contactPhone: l.contactPhone, contactName: l.contactName,
  distanceFromMetro: l.distanceFromMetro, description: l.description,
})), null, 0)}

Remember: Be ULTRA concise. 1-2 sentences max. Let the UI do the heavy lifting.`;

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
        temperature: 0.5,
        max_tokens: 2048,
      }),
    });

    const data = await response.json();

    if (data.base_resp?.status_code && data.base_resp.status_code !== 0) {
      console.error("MiniMax API error:", data.base_resp);
      return NextResponse.json({ error: data.base_resp.status_msg || "AI service error" }, { status: 502 });
    }

    const reply = data.choices?.[0]?.message?.content || "Sorry, try again!";

    // Extract PG IDs
    let matchedPGs: string[] = [];
    const jsonMatch = reply.match(/```json_results\s*(\[[\s\S]*?\])\s*```/);
    if (jsonMatch) {
      try { matchedPGs = JSON.parse(jsonMatch[1]); } catch {}
    }

    // Extract action
    let action = null;
    const actionMatch = reply.match(/```json_actions\s*(\{[\s\S]*?\})\s*```/);
    if (actionMatch) {
      try { action = JSON.parse(actionMatch[1]); } catch {}
    }

    // Clean reply text
    const cleanReply = reply
      .replace(/```json_results[\s\S]*?```/g, "")
      .replace(/```json_actions[\s\S]*?```/g, "")
      .replace(/---/g, "")
      .replace(/###\s*/g, "")
      .replace(/\*\*/g, "")
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
