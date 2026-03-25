import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/user/preferences - Get user preferences
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No preferences yet
        return NextResponse.json({
          preferences: {
            preferred_areas: [],
            preferred_gender: "any",
            min_budget: 0,
            max_budget: 100000,
            preferred_amenities: [],
            room_type_pref: "any",
          }
        });
      }
      return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
    }

    return NextResponse.json({ preferences: data });
  } catch (error) {
    console.error("Get preferences error:", error);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

// PUT /api/user/preferences - Update user preferences
export async function PUT(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "preferences", 10);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { userId, ...preferences } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const {
      preferred_areas,
      preferred_gender,
      min_budget,
      max_budget,
      preferred_amenities,
      room_type_pref,
      has_pets,
      dietary_requirements,
      lifestyle_preferences,
      work_area,
      commute_distance_max,
    } = preferences;

    const { error } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: userId,
        preferred_areas: preferred_areas || [],
        preferred_gender: preferred_gender || "any",
        min_budget: min_budget ?? 0,
        max_budget: max_budget ?? 100000,
        preferred_amenities: preferred_amenities || [],
        room_type_pref: room_type_pref || "any",
        has_pets: has_pets || false,
        dietary_requirements: dietary_requirements || [],
        lifestyle_preferences: lifestyle_preferences || [],
        work_area: work_area || "",
        commute_distance_max: commute_distance_max ?? 10,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error("Update preferences error:", error);
      return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
    }

    // Clear recommendations cache
    await supabase
      .from("recommendations_cache")
      .delete()
      .eq("user_id", userId);

    return NextResponse.json({ success: true, message: "Preferences updated" });
  } catch (error) {
    console.error("Update preferences error:", error);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}

// DELETE /api/user/preferences - Clear user preferences
export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 401 });
  }

  try {
    const { error } = await supabase
      .from("user_preferences")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Delete preferences error:", error);
      return NextResponse.json({ error: "Failed to delete preferences" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete preferences error:", error);
    return NextResponse.json({ error: "Failed to delete preferences" }, { status: 500 });
  }
}
