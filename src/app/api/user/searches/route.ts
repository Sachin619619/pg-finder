import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/user/searches - Get user's saved searches
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 401 });
  }

  try {
    const { data: searches, error } = await supabase
      .from("saved_searches")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("Get saved searches error:", error);
      return NextResponse.json({ error: "Failed to fetch searches" }, { status: 500 });
    }

    return NextResponse.json({ searches: searches || [] });
  } catch (error) {
    console.error("Get saved searches error:", error);
    return NextResponse.json({ error: "Failed to fetch searches" }, { status: 500 });
  }
}

// POST /api/user/searches - Save a search
export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "searches", 10);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { userId, name, filters, alertEnabled } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const {
      area,
      gender,
      minPrice,
      maxPrice,
      roomType,
      amenities,
    } = filters || {};

    const { data, error } = await supabase
      .from("saved_searches")
      .insert({
        user_id: userId,
        name: name || `Search ${new Date().toLocaleDateString()}`,
        search_params: {
          area,
          gender,
          minPrice,
          maxPrice,
          roomType,
          amenities,
        },
        alert_enabled: alertEnabled || false,
      })
      .select()
      .single();

    if (error) {
      console.error("Save search error:", error);
      return NextResponse.json({ error: "Failed to save search" }, { status: 500 });
    }

    // If alert enabled, create price alert for the area
    if (alertEnabled && area) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .eq("id", userId)
        .single();

      await supabase.from("price_alerts").insert({
        user_id: userId,
        email: profile?.email,
        area,
        max_price: maxPrice || 999999,
        is_active: true,
      });
    }

    return NextResponse.json({ success: true, savedSearch: data });
  } catch (error) {
    console.error("Save search error:", error);
    return NextResponse.json({ error: "Failed to save search" }, { status: 500 });
  }
}

// PUT /api/user/searches - Update saved search (e.g., toggle alert)
export async function PUT(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "searches", 10);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { userId, searchId, alertEnabled, name } = body;

    if (!userId || !searchId) {
      return NextResponse.json({ error: "User ID and Search ID required" }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (alertEnabled !== undefined) updates.alert_enabled = alertEnabled;
    if (name !== undefined) updates.name = name;
    updates.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from("saved_searches")
      .update(updates)
      .eq("id", searchId)
      .eq("user_id", userId);

    if (error) {
      console.error("Update saved search error:", error);
      return NextResponse.json({ error: "Failed to update search" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update saved search error:", error);
    return NextResponse.json({ error: "Failed to update search" }, { status: 500 });
  }
}

// DELETE /api/user/searches - Delete saved search
export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");
  const searchId = searchParams.get("searchId");

  if (!userId || !searchId) {
    return NextResponse.json({ error: "User ID and Search ID required" }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from("saved_searches")
      .delete()
      .eq("id", searchId)
      .eq("user_id", userId);

    if (error) {
      console.error("Delete saved search error:", error);
      return NextResponse.json({ error: "Failed to delete search" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete saved search error:", error);
    return NextResponse.json({ error: "Failed to delete search" }, { status: 500 });
  }
}
