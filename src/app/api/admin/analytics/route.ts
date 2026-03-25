import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchListings } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/admin/analytics - Admin analytics dashboard
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const apiKey = searchParams.get("apiKey");
  const period = searchParams.get("period") || "30"; // days

  // Simple auth check
  if (apiKey !== process.env.ADMIN_API_KEY && apiKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const periodDays = parseInt(period);
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

    // Get all listings
    const listings = await fetchListings();

    // User metrics
    const { count: totalUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: newUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startDate);

    // Booking metrics
    const { data: bookings } = await supabase
      .from("bookings")
      .select("status, created_at")
      .gte("created_at", startDate);

    const bookingStats = bookings?.reduce((acc: Record<string, number>, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, { pending: 0, confirmed: 0, cancelled: 0, completed: 0 }) || {};

    const bookingTrend = bookings?.reduce((acc: Record<string, number>, b) => {
      const date = b.created_at.split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {}) || {};

    // Visit metrics
    const { data: visits } = await supabase
      .from("scheduled_visits")
      .select("status, created_at")
      .gte("created_at", startDate);

    const visitStats = visits?.reduce((acc: Record<string, number>, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    }, { scheduled: 0, completed: 0, cancelled: 0, no_show: 0 }) || {};

    // User behavior summary
    const { data: behaviors } = await supabase
      .from("user_behavior")
      .select("action_type, created_at")
      .gte("created_at", startDate);

    const behaviorCounts = behaviors?.reduce((acc: Record<string, number>, b) => {
      acc[b.action_type] = (acc[b.action_type] || 0) + 1;
      return acc;
    }, {}) || {};

    // Top performing listings
    const listingPerformance = Object.entries(
      behaviors?.reduce((acc: Record<string, { views: number; clicks: number; bookings: number }>, b) => {
        if (!b.pg_id) return acc;
        if (!acc[b.pg_id]) acc[b.pg_id] = { views: 0, clicks: 0, bookings: 0 };
        if (b.action_type === "view") acc[b.pg_id].views++;
        if (b.action_type === "click") acc[b.pg_id].clicks++;
        if (b.action_type === "booking_complete") acc[b.pg_id].bookings++;
        return acc;
      }, {}) || {}
    )
      .map(([pgId, stats]) => {
        const listing = listings.find((l) => l.id === pgId);
        return {
          id: pgId,
          name: listing?.name || "Unknown",
          area: listing?.area || "Unknown",
          rating: listing?.rating || 0,
          ...stats,
          score: stats.views * 1 + stats.clicks * 3 + stats.bookings * 10,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Conversion funnel
    const totalViews = behaviorCounts["view"] || 0;
    const totalClicks = behaviorCounts["click"] || 0;
    const totalBookings = bookingStats.confirmed + bookingStats.pending;
    const totalVisits = visitStats.scheduled + visitStats.completed;

    const funnel = {
      views: { count: totalViews, rate: 100 },
      clicks: { count: totalClicks, rate: totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0 },
      searches: { count: behaviorCounts["search"] || 0, rate: totalViews > 0 ? Math.round(((behaviorCounts["search"] || 0) / totalViews) * 100) : 0 },
      bookings: { count: totalBookings, rate: totalViews > 0 ? Math.round((totalBookings / totalViews) * 100) : 0 },
      visits: { count: totalVisits, rate: totalBookings > 0 ? Math.round((totalVisits / totalBookings) * 100) : 0 },
    };

    // Listing quality summary
    const { data: listingScores } = await supabase
      .from("listing_scores")
      .select("*");

    const verifiedCount = listingScores?.filter((s) => s.verification_status === "verified").length || 0;
    const pendingCount = listingScores?.filter((s) => s.verification_status === "pending").length || 0;
    const avgScore = listingScores?.length
      ? listingScores.reduce((s, l) => s + (l.overall_score || 0), 0) / listingScores.length
      : 0;

    // Area performance
    const areaPerformance: Record<string, { views: number; bookings: number; listings: number }> = {};
    listings.forEach((l) => {
      const areaStats = listingPerformance
        .filter((lp) => lp.area === l.area)
        .reduce(
          (acc, lp) => {
            acc.views += lp.views;
            acc.bookings += lp.bookings;
            return acc;
          },
          { views: 0, bookings: 0 }
        );
      areaPerformance[l.area] = {
        ...areaStats,
        listings: (areaPerformance[l.area]?.listings || 0) + 1,
      };
    });

    return NextResponse.json({
      period: `${period} days`,
      overview: {
        totalListings: listings.length,
        totalUsers: totalUsers || 0,
        newUsers: newUsers || 0,
        avgListingScore: Math.round(avgScore * 100) / 100,
        verifiedListings: verifiedCount,
        pendingVerification: pendingCount,
      },
      bookings: {
        ...bookingStats,
        total: Object.values(bookingStats).reduce((s, c) => s + c, 0),
        trend: bookingTrend,
      },
      visits: {
        ...visitStats,
        total: Object.values(visitStats).reduce((s, c) => s + c, 0),
      },
      behaviors: behaviorCounts,
      funnel,
      topListings: listingPerformance,
      areaPerformance: Object.entries(areaPerformance)
        .map(([area, stats]) => ({ area, ...stats }))
        .sort((a, b) => b.views - a.views),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Admin analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
