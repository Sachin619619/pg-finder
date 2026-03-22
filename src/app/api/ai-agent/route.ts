import { NextResponse } from "next/server";
import { listings } from "@/data/listings";

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;

// MiniMax OpenAI-compatible endpoint
const API_URL = "https://api.minimaxi.chat/v1/chat/completions";

const SYSTEM_PROMPT = `You are PG Finder AI — a smart, friendly assistant that helps people find PG (Paying Guest) accommodations in Bangalore, India.

You have access to a database of PG listings. When the user asks to find PGs, you MUST analyze their requirements and return matching results.

IMPORTANT RESPONSE FORMAT:
- When recommending PGs, you MUST include a JSON block wrapped in \`\`\`json_results ... \`\`\` tags containing an array of matching PG IDs.
- Example: \`\`\`json_results ["pg-1", "pg-5", "pg-12"] \`\`\`
- Always put the json_results block at the END of your response.
- Keep your text response conversational, warm, and helpful with emojis.
- Highlight key details like price, area, amenities in your text.
- If no PGs match, say so kindly and suggest alternatives.

CAPABILITIES:
1. 🔍 Search PGs by area, price range, amenities, gender, room type
2. 📊 Compare multiple PGs side by side
3. 💡 Recommend PGs based on preferences
4. 📍 Provide area insights (nearby metro, landmarks, vibe)
5. 💰 Budget planning and cost breakdown
6. 🏠 Answer general questions about PG living in Bangalore

Here is the FULL PG database you can search through:
${JSON.stringify(listings.map(l => ({
  id: l.id,
  name: l.name,
  area: l.area,
  locality: l.locality,
  price: l.price,
  type: l.type,
  gender: l.gender,
  amenities: l.amenities,
  rating: l.rating,
  reviews: l.reviews,
  furnished: l.furnished,
  foodIncluded: l.foodIncluded,
  wifiIncluded: l.wifiIncluded,
  acAvailable: l.acAvailable,
  availableFrom: l.availableFrom,
  distanceFromMetro: l.distanceFromMetro,
  nearbyLandmarks: l.nearbyLandmarks,
  description: l.description,
})), null, 0)}

Always be helpful, concise, and proactive. If the user's query is vague, ask clarifying questions about budget, preferred area, gender preference, or must-have amenities.`;

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function POST(req: Request) {
  if (!MINIMAX_API_KEY) {
    return NextResponse.json(
      { error: "AI service not configured" },
      { status: 500 }
    );
  }

  try {
    const { messages } = (await req.json()) as { messages: Message[] };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array required" },
        { status: 400 }
      );
    }

    const fullMessages: Message[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages,
    ];

    // Try primary endpoint first, then fallback
    const endpoints = [
      API_URL,
      "https://api.minimax.chat/v1/chat/completions",
      "https://api.minimaxi.chat/v1/text/chatcompletion_v2",
    ];

    let response: Response | null = null;
    let lastError = "";

    for (const url of endpoints) {
      try {
        response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${MINIMAX_API_KEY}`,
          },
          body: JSON.stringify({
            model: "MiniMax-Text-01",
            messages: fullMessages,
            temperature: 0.7,
            max_tokens: 2048,
          }),
        });

        if (response.ok) break;

        lastError = await response.text();
        console.error(`MiniMax API error (${url}):`, lastError);
        response = null;
      } catch (e) {
        console.error(`MiniMax fetch error (${url}):`, e);
        lastError = String(e);
        response = null;
      }
    }

    if (!response || !response.ok) {
      console.error("All MiniMax endpoints failed:", lastError);
      return NextResponse.json(
        { error: "AI service temporarily unavailable" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply =
      data.choices?.[0]?.message?.content ||
      "Sorry, I couldn't process that. Please try again!";

    // Extract PG IDs from json_results block if present
    let matchedPGs: string[] = [];
    const jsonMatch = reply.match(/```json_results\s*(\[[\s\S]*?\])\s*```/);
    if (jsonMatch) {
      try {
        matchedPGs = JSON.parse(jsonMatch[1]);
      } catch {
        // ignore parse errors
      }
    }

    // Clean the reply text (remove the json_results block from display)
    const cleanReply = reply.replace(/```json_results[\s\S]*?```/g, "").trim();

    // Get full listing data for matched PGs
    const matchedListings = matchedPGs
      .map((id: string) => listings.find((l) => l.id === id))
      .filter(Boolean);

    return NextResponse.json({
      reply: cleanReply,
      listings: matchedListings,
    });
  } catch (error) {
    console.error("AI Agent error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
