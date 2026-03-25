import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchListings } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/ai/recommend - AI-powered recommendations using MiniMax
export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "ai", 10);
  if (limited) return limited;

  try {
    const body = await req.json();
    const {
      userId,
      preferences,
      searchQuery,
      context, // 'browsing', 'booking', 'visit', etc.
    } = body;

    // Fetch user preferences if available
    let userPrefs = preferences;
    if (userId && !userPrefs) {
      const { data } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();
      userPrefs = data;
    }

    // Fetch all listings
    const listings = await fetchListings();

    // Build context for AI
    const areaContext = userPrefs?.preferred_areas?.length
      ? `Preferred areas: ${userPrefs.preferred_areas.join(", ")}. `
      : "";
    const budgetContext = userPrefs?.min_budget && userPrefs?.max_budget
      ? `Budget: ₹${userPrefs.min_budget.toLocaleString()} - ₹${userPrefs.max_budget.toLocaleString()}. `
      : "";
    const genderContext = userPrefs?.preferred_gender && userPrefs.preferred_gender !== "any"
      ? `Looking for: ${userPrefs.preferred_gender}. `
      : "";
    const amenitiesContext = userPrefs?.preferred_amenities?.length
      ? `Important amenities: ${userPrefs.preferred_amenities.join(", ")}. `
      : "";

    const prompt = `You are a PG (paying guest accommodation) recommendation specialist for Castle Living in Bangalore.

${areaContext}${budgetContext}${genderContext}${amenitiesContext}
${searchQuery ? `User's natural language query: "${searchQuery}". ` : ""}
Context: ${context || 'general browsing'}

You have access to ${listings.length} PG listings. Your task is to recommend the BEST 5 listings that match the user's preferences.

For each recommendation, explain WHY it matches in 1-2 sentences.

Return your response as JSON:
{
  "recommendations": [
    {
      "id": "listing_id",
      "name": "PG Name",
      "area": "Area",
      "price": 8500,
      "matchReason": "Why this matches"
    }
  ],
  "summary": "Brief summary of the recommendations"
}

Rules:
- Only recommend listings that genuinely match preferences
- Focus on: location match, price within budget, rating 4+, required amenities
- Prioritize verified listings
- Be specific about WHY each recommendation matches`;

    // Call MiniMax API
    const apiKey = process.env.MINIMAX_API_KEY;
    if (!apiKey) {
      // Fallback to simple matching
      return NextResponse.json({
        recommendations: simpleRecommend(listings, userPrefs, 5),
        source: "fallback",
      });
    }

    const response = await fetch("https://api.minimax.io/v1/text/chatcompletion_pro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "MiniMax-Text-01",
        messages: [
          {
            role: "system",
            content: "You are a helpful PG recommendation assistant for Bangalore. Always respond with valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[AI] MiniMax error:", error);
      // Fallback to simple matching
      return NextResponse.json({
        recommendations: simpleRecommend(listings, userPrefs, 5),
        source: "fallback",
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({
        recommendations: simpleRecommend(listings, userPrefs, 5),
        source: "fallback",
      });
    }

    // Parse AI response
    let parsed;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(content);
      }
    } catch {
      console.error("[AI] Parse error, using fallback");
      return NextResponse.json({
        recommendations: simpleRecommend(listings, userPrefs, 5),
        source: "fallback",
      });
    }

    // Enrich recommendations with full listing data
    const enrichedRecommendations = (parsed.recommendations || []).map((rec: { id: string; matchReason?: string }) => {
      const listing = listings.find((l) => l.id === rec.id);
      if (listing) {
        return {
          ...listing,
          matchReason: rec.matchReason || "Matches your preferences",
        };
      }
      return rec;
    });

    // If AI didn't return enough, fill with fallback
    if (enrichedRecommendations.length < 5) {
      const fallback = simpleRecommend(listings, userPrefs, 5 - enrichedRecommendations.length);
      enrichedRecommendations.push(...fallback);
    }

    return NextResponse.json({
      recommendations: enrichedRecommendations.slice(0, 5),
      summary: parsed.summary || "Based on your preferences",
      source: "ai",
    });
  } catch (error) {
    console.error("[AI] Recommendation error:", error);
    return NextResponse.json({ error: "Failed to get recommendations" }, { status: 500 });
  }
}

function simpleRecommend(
  listings: ReturnType<typeof fetchListings> extends Promise<infer T ? T : never>,
  prefs: Record<string, unknown> | null | undefined,
  limit: number
): Array<{ id: string; name: string; area: string; price: number; rating: number; matchReason: string }> {
  if (!Array.isArray(listings)) return [];

  const scored = listings.map((pg) => {
    let score = 50;

    if (prefs?.preferred_areas?.length) {
      if (prefs.preferred_areas.includes(pg.area)) score += 30;
    }
    if (prefs?.min_budget !== undefined && prefs?.max_budget !== undefined) {
      if (pg.price >= prefs.min_budget && pg.price <= prefs.max_budget) score += 25;
    }
    if (pg.rating >= 4.5) score += 15;
    else if (pg.rating >= 4.0) score += 10;
    if (pg.reviews >= 20) score += 10;

    let matchReason = "Matches your criteria";
    if (prefs?.preferred_areas?.includes(pg.area)) {
      matchReason = `In your preferred area: ${pg.area}`;
    }

    return { ...pg, score, matchReason };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score, ...pg }) => pg);
}
