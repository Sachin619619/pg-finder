import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchListings } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/recommendations - Get personalized recommendations
export async function GET(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "recommendations", 20);
  if (limited) return limited;

  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");
  const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);
  const type = searchParams.get("type") || "personalized"; // personalized, trending, similar

  try {
    // Fetch user preferences if logged in
    let preferences: Record<string, unknown> = {};
    if (userId) {
      const { data } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId)
        .single();
      if (data) preferences = data;
    }

    // Get all active listings
    const listings = await fetchListings();

    // Score and rank listings based on preferences
    const scoredListings = listings.map((pg) => {
      let matchScore = 50; // Base score

      // Area preference matching
      if (preferences.preferred_areas?.length > 0) {
        const areaMatch = preferences.preferred_areas.includes(pg.area);
        if (areaMatch) matchScore += 25;
      }

      // Budget matching
      if (preferences.min_budget !== undefined && preferences.max_budget !== undefined) {
        if (pg.price >= preferences.min_budget && pg.price <= preferences.max_budget) {
          matchScore += 20;
        } else if (pg.price < preferences.min_budget) {
          matchScore += 10; // Below budget is okay
        }
      }

      // Rating boost
      if (pg.rating >= 4.5) matchScore += 15;
      else if (pg.rating >= 4.0) matchScore += 10;
      else if (pg.rating >= 3.5) matchScore += 5;

      // Amenity matching
      if (preferences.preferred_amenities?.length > 0) {
        const matchCount = pg.amenities.filter((a) =>
          preferences.preferred_amenities.includes(a)
        ).length;
        const matchRatio = matchCount / preferences.preferred_amenities.length;
        matchScore += Math.round(matchRatio * 15);
      }

      // Gender matching
      if (preferences.preferred_gender && preferences.preferred_gender !== "any") {
        if (pg.gender === preferences.preferred_gender || pg.gender === "coed") {
          matchScore += 10;
        }
      }

      // Room type preference
      if (preferences.room_type_pref && preferences.room_type_pref !== "any") {
        if (pg.type === preferences.room_type_pref) matchScore += 5;
      }

      // Popularity boost
      matchScore += Math.min(pg.reviews, 20); // Up to 20 points for reviews

      return {
        ...pg,
        matchScore: Math.min(100, matchScore),
      };
    });

    // Sort by match score
    scoredListings.sort((a, b) => b.matchScore - a.matchScore);

    // Apply trending boost if requested
    if (type === "trending") {
      scoredListings.sort((a, b) => {
        const trendingScoreA = a.reviews * 0.7 + a.rating * 20;
        const trendingScoreB = b.reviews * 0.7 + b.rating * 20;
        return trendingScoreB - trendingScoreA;
      });
    }

    const recommendations = scoredListings.slice(0, limit);

    // Cache recommendations
    if (userId) {
      await supabase
        .from("recommendations_cache")
        .upsert({
          user_id: userId,
          recommendation_type: type,
          recommendations: recommendations.slice(0, 20), // Cache top 20
          expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins
        }, {
          onConflict: 'user_id,recommendation_type'
        });
    }

    return NextResponse.json({
      recommendations,
      type,
      count: recommendations.length,
      cached: false,
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json({ error: "Failed to get recommendations" }, { status: 500 });
  }
}

// POST /api/recommendations - Save user preference and get recommendations
export async function POST(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      preferred_areas = [],
      preferred_gender = "any",
      min_budget = 0,
      max_budget = 100000,
      preferred_amenities = [],
      room_type_pref = "any",
    } = body;

    // Upsert preferences
    const { error } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: userId,
        preferred_areas,
        preferred_gender,
        min_budget,
        max_budget,
        preferred_amenities,
        room_type_pref,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error("Error saving preferences:", error);
      return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
    }

    // Clear recommendations cache
    await supabase
      .from("recommendations_cache")
      .delete()
      .eq("user_id", userId);

    return NextResponse.json({ success: true, message: "Preferences saved" });
  } catch (error) {
    console.error("Save preferences error:", error);
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 });
  }
}
