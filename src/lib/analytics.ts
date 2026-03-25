// Analytics Service - Backend analytics and reporting utilities
// For use in server components and API routes

import { supabase } from "./supabase";
import { fetchListings } from "./db";

export type ListingAnalytics = {
  pgId: string;
  views: number;
  searches: number;
  bookings: number;
  visits: number;
  conversionRate: number;
  avgRating: number;
  totalReviews: number;
};

export type AreaAnalytics = {
  area: string;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  totalListings: number;
  avgRating: number;
  priceTrend: "rising" | "falling" | "stable";
  trendPercentage: number;
};

export type UserAnalytics = {
  userId: string;
  totalSearches: number;
  totalViews: number;
  wishlistCount: number;
  bookingCount: number;
  avgSessionDuration: number;
  engagementScore: number;
};

// ─── Get Listing Analytics ───
export async function getListingAnalytics(
  pgId: string,
  periodDays: number = 30
): Promise<ListingAnalytics | null> {
  const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

  // Get behavior counts
  const { data: behaviors } = await supabase
    .from("user_behavior")
    .select("action_type")
    .eq("pg_id", pgId)
    .gte("created_at", startDate);

  const views = behaviors?.filter((b) => b.action_type === "view").length || 0;
  const searches = behaviors?.filter((b) => b.action_type === "click").length || 0;

  // Get bookings
  const { count: bookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact" })
    .eq("pg_id", pgId)
    .eq("status", "confirmed");

  // Get visits
  const { count: visits } = await supabase
    .from("scheduled_visits")
    .select("*", { count: "exact" })
    .eq("pg_id", pgId)
    .eq("status", "completed");

  // Get listing details
  const listings = await fetchListings();
  const listing = listings.find((l) => l.id === pgId);

  if (!listing) return null;

  const conversionRate = views > 0 ? ((bookings || 0) / views) * 100 : 0;

  return {
    pgId,
    views,
    searches,
    bookings: bookings || 0,
    visits: visits || 0,
    conversionRate: Math.round(conversionRate * 100) / 100,
    avgRating: listing.rating,
    totalReviews: listing.reviews,
  };
}

// ─── Get Area Analytics ───
export async function getAreaAnalytics(
  area?: string
): Promise<AreaAnalytics[]> {
  // Get from pre-calculated analytics
  let query = supabase
    .from("area_analytics")
    .select("*")
    .order("recorded_at", { ascending: false });

  if (area) {
    query = query.eq("area", area);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Get area analytics error:", error);
    return [];
  }

  // Get latest for each area
  const latestByArea = Object.values(
    data?.reduce((acc: Record<string, typeof data[0]>, record) => {
      if (!acc[record.area] || new Date(record.recorded_at) > new Date(acc[record.area].recorded_at)) {
        acc[record.area] = record;
      }
      return acc;
    }, {}) || {}
  );

  return latestByArea.map((r) => ({
    area: r.area,
    avgPrice: r.avg_price,
    minPrice: r.min_price,
    maxPrice: r.max_price,
    totalListings: r.total_listings,
    avgRating: r.avg_rating,
    priceTrend: r.price_trend,
    trendPercentage: r.trend_percentage,
  }));
}

// ─── Get User Analytics ───
export async function getUserAnalytics(
  userId: string,
  periodDays: number = 30
): Promise<UserAnalytics | null> {
  const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

  // Get behavior counts
  const { data: behaviors } = await supabase
    .from("user_behavior")
    .select("action_type")
    .eq("user_id", userId)
    .gte("created_at", startDate);

  if (!behaviors) return null;

  const actionCounts = behaviors.reduce((acc: Record<string, number>, b) => {
    acc[b.action_type] = (acc[b.action_type] || 0) + 1;
    return acc;
  }, {});

  // Get booking count
  const { count: bookingCount } = await supabase
    .from("bookings")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("status", "confirmed");

  // Get wishlist count
  const wishlistPgIds = behaviors
    .filter((b) => b.action_type === "wishlist_add")
    .map((b) => b.pg_id);
  const uniqueWishlist = [...new Set(wishlistPgIds)];

  // Calculate engagement score
  const engagementScore = Math.min(100, Math.round(
    (actionCounts["view"] || 0) * 1 +
    (actionCounts["click"] || 0) * 3 +
    (actionCounts["search"] || 0) * 2 +
    (actionCounts["wishlist_add"] || 0) * 5 +
    (actionCounts["booking_complete"] || 0) * 10
  ));

  return {
    userId,
    totalSearches: actionCounts["search"] || 0,
    totalViews: actionCounts["view"] || 0,
    wishlistCount: uniqueWishlist.length,
    bookingCount: bookingCount || 0,
    avgSessionDuration: 0, // Would need session tracking
    engagementScore,
  };
}

// ─── Get Market Overview ───
export async function getMarketOverview(): Promise<{
  totalListings: number;
  totalAreas: number;
  avgPrice: number;
  avgRating: number;
  totalBookings: number;
  totalVisits: number;
  periodBookings: number;
  periodVisits: number;
}> {
  const listings = await fetchListings();

  // Get current month stats
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: periodBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact" })
    .gte("created_at", startOfMonth.toISOString());

  const { count: periodVisits } = await supabase
    .from("scheduled_visits")
    .select("*", { count: "exact" })
    .gte("created_at", startOfMonth.toISOString());

  const { count: totalBookings } = await supabase
    .from("bookings")
    .select("*", { count: "exact" });

  const { count: totalVisits } = await supabase
    .from("scheduled_visits")
    .select("*", { count: "exact" });

  const avgPrice = listings.reduce((sum, l) => sum + l.price, 0) / listings.length;
  const avgRating = listings.reduce((sum, l) => sum + l.rating, 0) / listings.length;
  const areas = [...new Set(listings.map((l) => l.area))];

  return {
    totalListings: listings.length,
    totalAreas: areas.length,
    avgPrice: Math.round(avgPrice),
    avgRating: Math.round(avgRating * 10) / 10,
    totalBookings: totalBookings || 0,
    totalVisits: totalVisits || 0,
    periodBookings: periodBookings || 0,
    periodVisits: periodVisits || 0,
  };
}

// ─── Get Trending Listings ───
export async function getTrendingListings(
  periodDays: number = 7,
  limit: number = 10
): Promise<Array<{
  id: string;
  name: string;
  area: string;
  price: number;
  rating: number;
  views: number;
  bookings: number;
  trendScore: number;
}>> {
  const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000).toISOString();

  // Get behavior data
  const { data: behaviors } = await supabase
    .from("user_behavior")
    .select("pg_id, action_type")
    .gte("created_at", startDate)
    .in("action_type", ["view", "click", "booking_complete"]);

  // Aggregate by PG
  const pgStats: Record<string, { views: number; clicks: number; bookings: number }> = {};

  behaviors?.forEach((b) => {
    if (!b.pg_id) return;
    if (!pgStats[b.pg_id]) {
      pgStats[b.pg_id] = { views: 0, clicks: 0, bookings: 0 };
    }
    if (b.action_type === "view") pgStats[b.pg_id].views++;
    if (b.action_type === "click") pgStats[b.pg_id].clicks++;
    if (b.action_type === "booking_complete") pgStats[b.pg_id].bookings++;
  });

  // Get listings and combine with stats
  const listings = await fetchListings();

  const trending = listings
    .map((listing) => {
      const stats = pgStats[listing.id] || { views: 0, clicks: 0, bookings: 0 };
      const trendScore = stats.views * 1 + stats.clicks * 3 + stats.bookings * 10;

      return {
        id: listing.id,
        name: listing.name,
        area: listing.area,
        price: listing.price,
        rating: listing.rating,
        views: stats.views,
        bookings: stats.bookings,
        trendScore,
      };
    })
    .filter((l) => l.views > 0 || l.bookings > 0)
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, limit);

  return trending;
}

// ─── Calculate Similar Listings ───
export async function getSimilarListings(
  pgId: string,
  limit: number = 5
): Promise<Array<{
  id: string;
  name: string;
  area: string;
  price: number;
  rating: number;
  similarityScore: number;
}>> {
  const listings = await fetchListings();
  const target = listings.find((l) => l.id === pgId);

  if (!target) return [];

  // Calculate similarity scores
  const scored = listings
    .filter((l) => l.id !== pgId)
    .map((listing) => {
      let score = 0;

      // Same area: +40
      if (listing.area === target.area) score += 40;

      // Similar price (±20%): +30
      const priceDiff = Math.abs(listing.price - target.price) / target.price;
      if (priceDiff <= 0.2) score += 30;
      else if (priceDiff <= 0.5) score += 15;

      // Same gender: +15
      if (listing.gender === target.gender) score += 15;

      // Similar rating (±0.5): +10
      if (Math.abs(listing.rating - target.rating) <= 0.5) score += 10;

      // Common amenities
      const commonAmenities = listing.amenities.filter((a) =>
        target.amenities.includes(a)
      ).length;
      score += commonAmenities * 2; // +2 per common amenity

      return {
        ...listing,
        similarityScore: score,
      };
    });

  return scored
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);
}
