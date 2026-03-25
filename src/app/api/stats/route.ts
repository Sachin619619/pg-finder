import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchListings } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/stats - Get platform statistics
export async function GET(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "stats", 30);
  if (limited) return limited;

  try {
    const listings = await fetchListings();

    // Get counts from Supabase
    const [
      { count: totalUsers },
      { count: totalBookings },
      { count: totalVisits },
      { count: totalReviews },
    ] = await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("bookings").select("*", { count: "exact", head: true }),
      supabase.from("scheduled_visits").select("*", { count: "exact", head: true }),
      supabase.from("reviews").select("*", { count: "exact", head: true }),
    ]);

    // Calculate listing statistics
    const prices = listings.map((l) => l.price);
    const ratings = listings.map((l) => l.rating);
    const reviews = listings.map((l) => l.reviews);

    const avgPrice = prices.reduce((s, p) => s + p, 0) / prices.length;
    const avgRating = ratings.reduce((s, r) => s + r, 0) / ratings.length;
    const totalReviewsCount = reviews.reduce((s, r) => s + r, 0);

    // Area distribution
    const areaCounts: Record<string, number> = {};
    listings.forEach((l) => {
      areaCounts[l.area] = (areaCounts[l.area] || 0) + 1;
    });
    const topAreas = Object.entries(areaCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([area, count]) => ({ area, count }));

    // Amenity popularity
    const amenityCounts: Record<string, number> = {};
    listings.forEach((l) => {
      l.amenities.forEach((a) => {
        amenityCounts[a] = (amenityCounts[a] || 0) + 1;
      });
    });
    const popularAmenities = Object.entries(amenityCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([amenity, count]) => ({ amenity, count }));

    // Gender distribution
    const genderCounts: Record<string, number> = {};
    listings.forEach((l) => {
      genderCounts[l.gender] = (genderCounts[l.gender] || 0) + 1;
    });

    // Room type distribution
    const roomTypeCounts: Record<string, number> = {};
    listings.forEach((l) => {
      roomTypeCounts[l.type] = (roomTypeCounts[l.type] || 0) + 1;
    });

    // Get recent activity
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { count: recentBookings } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo);

    const { count: recentVisits } = await supabase
      .from("scheduled_visits")
      .select("*", { count: "exact", head: true })
      .gte("created_at", sevenDaysAgo);

    // Price range distribution
    const priceRanges = [
      { range: "0-5000", min: 0, max: 5000, count: 0 },
      { range: "5001-8000", min: 5001, max: 8000, count: 0 },
      { range: "8001-12000", min: 8001, max: 12000, count: 0 },
      { range: "12001-20000", min: 12001, max: 20000, count: 0 },
      { range: "20001+", min: 20001, max: Infinity, count: 0 },
    ];

    prices.forEach((p) => {
      const range = priceRanges.find((r) => p >= r.min && p <= r.max);
      if (range) range.count++;
    });

    return NextResponse.json({
      overview: {
        totalListings: listings.length,
        totalUsers: totalUsers || 0,
        totalBookings: totalBookings || 0,
        totalVisits: totalVisits || 0,
        totalReviews: totalReviews || 0,
      },
      averages: {
        price: Math.round(avgPrice),
        rating: Math.round(avgRating * 10) / 10,
        reviewsPerListing: Math.round((totalReviewsCount / listings.length) * 10) / 10,
      },
      recentActivity: {
        bookings7Days: recentBookings || 0,
        visits7Days: recentVisits || 0,
      },
      distributions: {
        byArea: topAreas,
        byGender: genderCounts,
        byRoomType: roomTypeCounts,
        byPriceRange: priceRanges,
        byAmenity: popularAmenities,
      },
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices),
        median: prices.sort((a, b) => a - b)[Math.floor(prices.length / 2)],
      },
      ratingDistribution: {
        "4.5+": listings.filter((l) => l.rating >= 4.5).length,
        "4.0-4.4": listings.filter((l) => l.rating >= 4.0 && l.rating < 4.5).length,
        "3.5-3.9": listings.filter((l) => l.rating >= 3.5 && l.rating < 4.0).length,
        "3.0-3.4": listings.filter((l) => l.rating >= 3.0 && l.rating < 3.5).length,
        "<3.0": listings.filter((l) => l.rating < 3.0).length,
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}
