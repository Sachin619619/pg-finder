import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/user/feed - Get user's personalized activity feed
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Get user's behavior
    const { data: behaviors } = await supabase
      .from("user_behavior")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", thirtyDaysAgo)
      .order("created_at", { ascending: false })
      .limit(limit * 2); // Fetch more to filter

    if (!behaviors || behaviors.length === 0) {
      return NextResponse.json({
        feed: [],
        stats: {
          totalActions: 0,
          topAreas: [],
          recentActivity: "No recent activity",
        },
      });
    }

    // Get user's preferences
    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("preferred_areas")
      .eq("user_id", userId)
      .single();

    // Get listings data for enrichment
    const pgIds = [...new Set(behaviors.map((b) => b.pg_id).filter(Boolean))];
    const { data: listings } = await supabase
      .from("listings")
      .select("id, name, area, price, rating, images")
      .in("id", pgIds);

    const listingsMap = new Map(listings?.map((l) => [l.id, l]) || []);

    // Build activity feed
    const feedItems = behaviors
      .filter((b) => b.pg_id && listingsMap.has(b.pg_id))
      .slice(0, limit)
      .map((behavior) => {
        const listing = listingsMap.get(behavior.pg_id);
        return {
          id: behavior.id,
          type: behavior.action_type,
          pg: listing ? {
            id: listing.id,
            name: listing.name,
            area: listing.area,
            price: listing.price,
            rating: listing.rating,
            image: listing.images?.[0],
          } : null,
          timestamp: behavior.created_at,
          metadata: behavior.metadata,
        };
      })
      .filter((item) => item.pg !== null);

    // Calculate stats
    const actionCounts = behaviors.reduce((acc: Record<string, number>, b) => {
      acc[b.action_type] = (acc[b.action_type] || 0) + 1;
      return acc;
    }, {});

    // Top areas based on views
    const areaViews: Record<string, number> = {};
    behaviors
      .filter((b) => b.action_type === "view" && b.pg_id)
      .forEach((b) => {
        const listing = listingsMap.get(b.pg_id);
        if (listing?.area) {
          areaViews[listing.area] = (areaViews[listing.area] || 0) + 1;
        }
      });

    const topAreas = Object.entries(areaViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([area, count]) => ({ area, count }));

    // Recent activity summary
    const recentActivity = getActivitySummary(actionCounts);

    return NextResponse.json({
      feed: feedItems,
      stats: {
        totalActions: behaviors.length,
        actionCounts,
        topAreas,
        recentActivity,
        preferredAreas: preferences?.preferred_areas || [],
      },
    });
  } catch (error) {
    console.error("User feed error:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}

function getActivitySummary(actionCounts: Record<string, number>): string {
  const views = actionCounts["view"] || 0;
  const searches = actionCounts["search"] || 0;
  const wishlists = actionCounts["wishlist_add"] || 0;
  const bookings = actionCounts["booking_complete"] || 0;

  if (bookings > 0) {
    return `You've booked ${bookings} PG${bookings > 1 ? "s" : ""}!`;
  }
  if (wishlists > 0) {
    return `You've saved ${wishlists} listing${wishlists > 1 ? "s" : ""} to your wishlist`;
  }
  if (searches > 0) {
    return `You've searched ${searches} time${searches > 1 ? "s" : ""}`;
  }
  if (views > 0) {
    return `You've viewed ${views} listing${views > 1 ? "s" : ""}`;
  }
  return "Start exploring PGs!";
}

// POST /api/user/feed - Update feed preferences
export async function PUT(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "feed", 10);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { userId, feedPreferences } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    // Store feed preferences
    // This could be used to filter what shows up in the feed
    const { error } = await supabase
      .from("user_preferences")
      .update({
        metadata: feedPreferences,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Update feed preferences error:", error);
      return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update feed preferences error:", error);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
