import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/analytics/trends - Get market trends and insights
export async function GET(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "analytics", 30);
  if (limited) return limited;

  const { searchParams } = req.nextUrl;
  const period = searchParams.get("period") || "7"; // days

  try {
    const periodDays = parseInt(period);
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

    // 1. User behavior trends
    const { data: behaviors } = await supabase
      .from("user_behavior")
      .select("action_type, created_at")
      .gte("created_at", startDate);

    const behaviorTrends = behaviors?.reduce((acc: Record<string, number>, b) => {
      acc[b.action_type] = (acc[b.action_type] || 0) + 1;
      return acc;
    }, {}) || {};

    // 2. Popular areas by searches
    const { data: searchBehaviors } = await supabase
      .from("user_behavior")
      .select("metadata, created_at")
      .eq("action_type", "search")
      .gte("created_at", startDate);

    const areaSearchCounts: Record<string, number> = {};
    searchBehaviors?.forEach((b) => {
      const area = b.metadata?.area || "unknown";
      areaSearchCounts[area] = (areaSearchCounts[area] || 0) + 1;
    });

    const topSearchedAreas = Object.entries(areaSearchCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([area, count]) => ({ area, searchCount: count }));

    // 3. Trending listings (most views in period)
    const { data: trendingListings } = await supabase
      .from("listings")
      .select("id, name, area, rating, reviews, price")
      .eq("status", "active")
      .order("reviews", { ascending: false })
      .limit(10);

    // 4. Booking trends
    const { data: bookings } = await supabase
      .from("bookings")
      .select("status, created_at")
      .gte("created_at", startDate);

    const bookingStats = bookings?.reduce((acc: Record<string, number>, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, { pending: 0, confirmed: 0, cancelled: 0, completed: 0 }) || {
      pending: 0, confirmed: 0, cancelled: 0, completed: 0
    };

    // 5. Visit trends
    const { data: visits } = await supabase
      .from("scheduled_visits")
      .select("status, created_at")
      .gte("created_at", startDate);

    const visitStats = visits?.reduce((acc: Record<string, number>, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    }, { scheduled: 0, completed: 0, cancelled: 0, no_show: 0 }) || {
      scheduled: 0, completed: 0, cancelled: 0, no_show: 0
    };

    // 6. Price trends by area
    const { data: areaAnalytics } = await supabase
      .from("area_analytics")
      .select("*")
      .order("recorded_at", { ascending: false });

    const latestAreaAnalytics = Object.values(
      areaAnalytics?.reduce((acc: Record<string, typeof areaAnalytics[0]>, a) => {
        if (!acc[a.area] || new Date(a.recorded_at) > new Date(acc[a.area].recorded_at)) {
          acc[a.area] = a;
        }
        return acc;
      }, {}) || {}
    ).slice(0, 20);

    // 7. Daily activity chart
    const dailyActivity: Record<string, {
      date: string;
      views: number;
      searches: number;
      bookings: number;
      visits: number;
    }> = {};

    const allBehaviors = behaviors || [];
    for (let i = 0; i < periodDays; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      dailyActivity[date] = { date, views: 0, searches: 0, bookings: 0, visits: 0 };
    }

    allBehaviors.forEach((b) => {
      const date = b.created_at.split("T")[0];
      if (dailyActivity[date]) {
        if (b.action_type === "view") dailyActivity[date].views++;
        if (b.action_type === "search") dailyActivity[date].searches++;
      }
    });

    bookings?.forEach((b) => {
      const date = b.created_at.split("T")[0];
      if (dailyActivity[date]) dailyActivity[date].bookings++;
    });

    visits?.forEach((v) => {
      const date = v.created_at.split("T")[0];
      if (dailyActivity[date]) dailyActivity[date].visits++;
    });

    // 8. Amenity popularity
    const { data: listingsWithAmenities } = await supabase
      .from("listings")
      .select("amenities")
      .eq("status", "active");

    const amenityCounts: Record<string, number> = {};
    listingsWithAmenities?.forEach((l) => {
      l.amenities?.forEach((a: string) => {
        amenityCounts[a] = (amenityCounts[a] || 0) + 1;
      });
    });

    const popularAmenities = Object.entries(amenityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([amenity, count]) => ({ amenity, count }));

    return NextResponse.json({
      period: `${period} days`,
      behaviorTrends,
      topSearchedAreas,
      trendingListings: trendingListings || [],
      bookingStats,
      visitStats,
      areaAnalytics: latestAreaAnalytics,
      dailyActivity: Object.values(dailyActivity).sort((a, b) => a.date.localeCompare(b.date)),
      popularAmenities,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Trends error:", error);
    return NextResponse.json({ error: "Failed to fetch trends" }, { status: 500 });
  }
}
