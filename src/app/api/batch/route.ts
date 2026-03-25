import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchListings } from "@/lib/db";

// POST /api/batch - Run batch operations (scoring, analytics, etc.)
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "recalculate_scores":
        return await recalculateAllListingScores();
      
      case "update_area_analytics":
        return await updateAreaAnalytics();
      
      case "process_behavior":
        return await processBehaviorAnalytics();
      
      case "cleanup_old_data":
        return await cleanupOldData();
      
      case "full_refresh":
        const scores = await recalculateAllListingScores();
        const analytics = await updateAreaAnalytics();
        const behavior = await processBehaviorAnalytics();
        return NextResponse.json({
          success: true,
          results: {
            scores: scores,
            analytics: analytics,
            behavior: behavior,
          }
        });

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Batch operation error:", error);
    return NextResponse.json({ error: "Failed to run batch operation" }, { status: 500 });
  }
}

async function recalculateAllListingScores() {
  const listings = await fetchListings();
  let processed = 0;
  let failed = 0;

  for (const listing of listings) {
    try {
      // Calculate scores
      const priceScore = Math.max(0, Math.min(5, 5 - ((listing.price - 15000) / 15000) * 2));
      const importantAmenities = ['WiFi', 'AC', 'Food', 'Power Backup', 'Security'];
      const amenityMatches = listing.amenities.filter((a) =>
        importantAmenities.some((ia) => a.toLowerCase().includes(ia.toLowerCase()))
      ).length;
      const amenityScore = (amenityMatches / importantAmenities.length) * 5;
      const ratingScore = Math.min(5, listing.rating);
      const reviewsScore = Math.min(5, (listing.reviews / 50) * 5);

      const overallScore = (
        priceScore * 0.2 +
        amenityScore * 0.25 +
        ratingScore * 0.25 +
        reviewsScore * 0.15 +
        3.5 * 0.15 // location score default
      );

      await supabase
        .from("listing_scores")
        .upsert({
          pg_id: listing.id,
          overall_score: Math.round(overallScore * 100) / 100,
          price_score: Math.round(priceScore * 100) / 100,
          amenity_score: Math.round(amenityScore * 100) / 100,
          location_score: 3.5,
          hygiene_score: Math.round(ratingScore * 100) / 100,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'pg_id'
        });

      processed++;
    } catch (err) {
      console.error(`Failed to score listing ${listing.id}:`, err);
      failed++;
    }
  }

  return { action: "recalculate_scores", processed, failed };
}

async function updateAreaAnalytics() {
  const listings = await fetchListings();

  // Group by area
  const areaStats: Record<string, {
    prices: number[];
    ratings: number[];
    listings: string[];
  }> = {};

  listings.forEach((pg) => {
    if (!areaStats[pg.area]) {
      areaStats[pg.area] = { prices: [], ratings: [], listings: [] };
    }
    areaStats[pg.area].prices.push(pg.price);
    areaStats[pg.area].ratings.push(pg.rating);
    areaStats[pg.area].listings.push(pg.id);
  });

  let processed = 0;
  let failed = 0;

  for (const [area, stats] of Object.entries(areaStats)) {
    try {
      const avgPrice = stats.prices.reduce((s, p) => s + p, 0) / stats.prices.length;
      const avgRating = stats.ratings.reduce((s, r) => s + r, 0) / stats.ratings.length;

      // Get previous analytics to calculate trend
      const { data: prev } = await supabase
        .from("area_analytics")
        .select("avg_price")
        .eq("area", area)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .single();

      let trend: "rising" | "falling" | "stable" = "stable";
      let trendPercentage = 0;

      if (prev) {
        trendPercentage = ((avgPrice - prev.avg_price) / prev.avg_price) * 100;
        if (trendPercentage > 2) trend = "rising";
        else if (trendPercentage < -2) trend = "falling";
      }

      await supabase
        .from("area_analytics")
        .insert({
          area,
          avg_price: Math.round(avgPrice),
          min_price: Math.min(...stats.prices),
          max_price: Math.max(...stats.prices),
          total_listings: stats.listings.length,
          avg_rating: Math.round(avgRating * 100) / 100,
          price_trend: trend,
          trend_percentage: Math.round(trendPercentage * 10) / 10,
          recorded_at: new Date().toISOString(),
        });

      processed++;
    } catch (err) {
      console.error(`Failed to update analytics for ${area}:`, err);
      failed++;
    }
  }

  return { action: "update_area_analytics", processed, failed };
}

async function processBehaviorAnalytics() {
  // Aggregate behavior for the last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: behaviors } = await supabase
    .from("user_behavior")
    .select("*")
    .gte("created_at", sevenDaysAgo);

  if (!behaviors || behaviors.length === 0) {
    return { action: "process_behavior", processed: 0, failed: 0 };
  }

  // Calculate daily aggregates
  const dailyStats: Record<string, {
    date: string;
    total_actions: number;
    unique_users: number;
    views: number;
    searches: number;
    bookings: number;
  }> = {};

  const uniqueUsers = new Set<string>();

  behaviors.forEach((b) => {
    const date = b.created_at.split("T")[0];
    if (!dailyStats[date]) {
      dailyStats[date] = {
        date,
        total_actions: 0,
        unique_users: 0,
        views: 0,
        searches: 0,
        bookings: 0,
      };
    }
    dailyStats[date].total_actions++;
    if (b.action_type === "view") dailyStats[date].views++;
    if (b.action_type === "search") dailyStats[date].searches++;
    if (b.action_type === "booking_complete") dailyStats[date].bookings++;
    if (b.user_id) uniqueUsers.add(b.user_id);
  });

  // Store aggregated stats (could create a separate table for this)
  console.log("Daily behavior stats:", dailyStats);

  return {
    action: "process_behavior",
    processed: Object.keys(dailyStats).length,
    failed: 0,
    stats: dailyStats,
  };
}

async function cleanupOldData() {
  // Delete behavior records older than 90 days
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from("user_behavior")
    .delete()
    .lt("created_at", ninetyDaysAgo);

  if (error) {
    console.error("Cleanup error:", error);
    return { action: "cleanup_old_data", deleted: 0, failed: 1 };
  }

  // Delete expired recommendation caches
  await supabase
    .from("recommendations_cache")
    .delete()
    .lt("expires_at", new Date().toISOString());

  return { action: "cleanup_old_data", deleted: "old behavior records", failed: 0 };
}
