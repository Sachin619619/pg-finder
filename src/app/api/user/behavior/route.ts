import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/user/behavior - Track user behavior
export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "behavior", 60);
  if (limited) return limited;

  try {
    const body = await req.json();
    const {
      userId,
      pgId,
      actionType,
      metadata = {},
      sessionId,
      deviceType,
    } = body;

    if (!actionType) {
      return NextResponse.json({ error: "Action type required" }, { status: 400 });
    }

    // Validate action type
    const validActions = [
      'view', 'click', 'search', 'wishlist_add', 'wishlist_remove',
      'booking_start', 'booking_complete', 'visit_scheduled', 'visit_completed',
      'review_submit', 'share', 'compare', 'filter_apply'
    ];

    if (!validActions.includes(actionType)) {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    // Insert behavior record
    const { error } = await supabase
      .from("user_behavior")
      .insert({
        user_id: userId || null,
        pg_id: pgId || null,
        action_type: actionType,
        metadata,
        session_id: sessionId || null,
        device_type: deviceType || 'unknown',
      });

    if (error) {
      console.error("Track behavior error:", error);
      // Don't fail the request, just log
    }

    // Update listing view/search counts
    if (pgId && actionType === 'view') {
      await supabase.rpc('increment_view_count', { pg_id: pgId }).catch(() => {});
    }
    if (pgId && actionType === 'click') {
      await supabase.rpc('increment_search_count', { pg_id: pgId }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track behavior error:", error);
    return NextResponse.json({ error: "Failed to track behavior" }, { status: 500 });
  }
}

// GET /api/user/behavior - Get user behavior analytics
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");
  const period = searchParams.get("period") || "30"; // days

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 401 });
  }

  try {
    const periodDays = parseInt(period);
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

    // Get user's behavior
    const { data: behaviors, error } = await supabase
      .from("user_behavior")
      .select("*")
      .eq("user_id", userId)
      .gte("created_at", startDate)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get behavior error:", error);
      return NextResponse.json({ error: "Failed to fetch behavior" }, { status: 500 });
    }

    // Aggregate by action type
    const actionCounts = behaviors?.reduce((acc: Record<string, number>, b) => {
      acc[b.action_type] = (acc[b.action_type] || 0) + 1;
      return acc;
    }, {}) || {};

    // Get viewed listings
    const viewedPgIds = behaviors
      ?.filter((b) => b.action_type === 'view' && b.pg_id)
      .map((b) => b.pg_id) || [];

    const uniqueViewed = [...new Set(viewedPgIds)];

    // Get wishlist actions
    const wishlistAdds = behaviors?.filter((b) => b.action_type === 'wishlist_add').length || 0;
    const wishlistRemoves = behaviors?.filter((b) => b.action_type === 'wishlist_remove').length || 0;

    // Calculate engagement score (0-100)
    const viewWeight = 1;
    const clickWeight = 3;
    const searchWeight = 2;
    const wishlistWeight = 5;
    const bookingWeight = 10;

    const engagementScore = Math.min(100, Math.round(
      (actionCounts['view'] || 0) * viewWeight +
      (actionCounts['click'] || 0) * clickWeight +
      (actionCounts['search'] || 0) * searchWeight +
      (actionCounts['wishlist_add'] || 0) * wishlistWeight +
      (actionCounts['booking_complete'] || 0) * bookingWeight
    ));

    // Daily activity
    const dailyActivity: Record<string, number> = {};
    behaviors?.forEach((b) => {
      const date = b.created_at.split("T")[0];
      dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });

    return NextResponse.json({
      period: `${period} days`,
      totalActions: behaviors?.length || 0,
      actionCounts,
      uniqueListingsViewed: uniqueViewed.length,
      viewedPgIds: uniqueViewed.slice(0, 20), // Last 20
      wishlistNet: wishlistAdds - wishlistRemoves,
      engagementScore,
      dailyActivity: Object.entries(dailyActivity)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-14) // Last 14 days
        .map(([date, count]) => ({ date, count })),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get behavior error:", error);
    return NextResponse.json({ error: "Failed to fetch behavior" }, { status: 500 });
  }
}
