import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/analytics/price - Get price analytics for areas
export async function GET(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "analytics", 30);
  if (limited) return limited;

  const { searchParams } = req.nextUrl;
  const area = searchParams.get("area");
  const period = searchParams.get("period") || "30"; // days

  try {
    // Get price history for the period
    const periodDays = parseInt(period);
    const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

    let query = supabase
      .from("price_history")
      .select("*")
      .gte("recorded_at", startDate)
      .order("recorded_at", { ascending: true });

    if (area) {
      query = query.eq("area", area);
    }

    const { data: priceHistory, error } = await query;

    if (error) {
      console.error("Price history error:", error);
      return NextResponse.json({ error: "Failed to fetch price data" }, { status: 500 });
    }

    // Get current listings for comparison
    const { data: currentListings } = await supabase
      .from("listings")
      .select("area, price, type")
      .eq("status", "active");

    // Calculate area-wise statistics
    const areaStats: Record<string, {
      area: string;
      avgPrice: number;
      minPrice: number;
      maxPrice: number;
      medianPrice: number;
      priceHistory: Array<{ date: string; avgPrice: number }>;
      trend: "rising" | "falling" | "stable";
      trendPercentage: number;
    }> = {};

    // Group by area
    const areaGroups: Record<string, number[]> = {};
    currentListings?.forEach((listing) => {
      const a = listing.area;
      if (!areaGroups[a]) areaGroups[a] = [];
      areaGroups[a].push(listing.price);
    });

    // Calculate stats per area
    Object.entries(areaGroups).forEach(([a, prices]) => {
      const sorted = [...prices].sort((a, b) => a - b);
      const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const median = sorted.length % 2 === 0
        ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
        : sorted[Math.floor(sorted.length / 2)];

      // Calculate trend from history
      const historyByDate = priceHistory
        ?.filter((p) => p.area === a)
        .reduce((acc: Record<string, number[]>, p) => {
          const date = p.recorded_at.split("T")[0];
          if (!acc[date]) acc[date] = [];
          acc[date].push(p.price);
          return acc;
        }, {});

      const historyArray = historyByDate
        ? Object.entries(historyByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-7) // Last 7 data points
        : [];

      let trend: "rising" | "falling" | "stable" = "stable";
      let trendPercentage = 0;

      if (historyArray.length >= 2) {
        const firstAvg = historyArray[0][1].reduce((s, p) => s + p, 0) / historyArray[0][1].length;
        const lastAvg = historyArray[historyArray.length - 1][1].reduce((s, p) => s + p, 0) / historyArray[historyArray.length - 1][1].length;
        trendPercentage = firstAvg > 0 ? ((lastAvg - firstAvg) / firstAvg) * 100 : 0;
        if (trendPercentage > 2) trend = "rising";
        else if (trendPercentage < -2) trend = "falling";
      }

      areaStats[a] = {
        area: a,
        avgPrice: Math.round(avg),
        minPrice: Math.min(...prices),
        maxPrice: Math.max(...prices),
        medianPrice: Math.round(median),
        priceHistory: historyArray.map(([date, prices]) => ({
          date,
          avgPrice: Math.round(prices.reduce((s, p) => s + p, 0) / prices.length),
        })),
        trend,
        trendPercentage: Math.round(trendPercentage * 10) / 10,
      };
    });

    // Get room type breakdown
    const roomTypeBreakdown = currentListings?.reduce((acc: Record<string, {
      type: string;
      count: number;
      avgPrice: number;
    }>, listing) => {
      const t = listing.type || "any";
      if (!acc[t]) acc[t] = { type: t, count: 0, totalPrice: 0 };
      acc[t].count++;
      acc[t].totalPrice += listing.price;
      return acc;
    }, {});

    const roomTypeStats = roomTypeBreakdown
      ? Object.values(roomTypeBreakdown).map(({ type, count, totalPrice, ...rest }) => ({
          type,
          count,
          avgPrice: Math.round(totalPrice / count),
        }))
      : [];

    return NextResponse.json({
      areas: Object.values(areaStats),
      roomTypes: roomTypeStats,
      period: `${period} days`,
      totalListings: currentListings?.length || 0,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Price analytics error:", error);
    return NextResponse.json({ error: "Failed to calculate analytics" }, { status: 500 });
  }
}

// POST /api/analytics/price - Record price change (for cron job)
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Simple auth check
  if (apiKey !== serviceKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all active listings and record their prices
    const { data: listings } = await supabase
      .from("listings")
      .select("id, area, price, type")
      .eq("status", "active");

    if (!listings || listings.length === 0) {
      return NextResponse.json({ success: true, recorded: 0 });
    }

    const records = listings.map((l) => ({
      pg_id: l.id,
      area: l.area,
      price: l.price,
      room_type: l.type,
      recorded_at: new Date().toISOString(),
    }));

    const { error } = await supabase.from("price_history").insert(records);

    if (error) {
      console.error("Record price error:", error);
      return NextResponse.json({ error: "Failed to record prices" }, { status: 500 });
    }

    // Update area analytics
    const areaStats: Record<string, { total: number; count: number; min: number; max: number; rating: number }> = {};

    listings.forEach((l) => {
      if (!areaStats[l.area]) {
        areaStats[l.area] = { total: 0, count: 0, min: Infinity, max: 0, rating: 0 };
      }
      areaStats[l.area].total += l.price;
      areaStats[l.area].count++;
      areaStats[l.area].min = Math.min(areaStats[l.area].min, l.price);
      areaStats[l.area].max = Math.max(areaStats[l.area].max, l.price);
    });

    const analyticsRecords = Object.entries(areaStats).map(([area, stats]) => ({
      area,
      avg_price: Math.round(stats.total / stats.count),
      min_price: stats.min === Infinity ? 0 : stats.min,
      max_price: stats.max,
      total_listings: stats.count,
      recorded_at: new Date().toISOString(),
    }));

    await supabase.from("area_analytics").upsert(analyticsRecords, { onConflict: 'area' });

    return NextResponse.json({ success: true, recorded: records.length });
  } catch (error) {
    console.error("Record prices error:", error);
    return NextResponse.json({ error: "Failed to record prices" }, { status: 500 });
  }
}
