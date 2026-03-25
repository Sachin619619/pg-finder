// Recommendation Service - Smart PG recommendations engine
// Uses collaborative filtering, content-based matching, and AI assistance

import { supabase } from "./supabase";
import { fetchListings } from "./db";

export type UserPreferences = {
  preferred_areas?: string[];
  preferred_gender?: string;
  min_budget?: number;
  max_budget?: number;
  preferred_amenities?: string[];
  room_type_pref?: string;
  has_pets?: boolean;
  lifestyle_preferences?: string[];
  work_area?: string;
  commute_distance_max?: number;
};

export type RecommendationOptions = {
  userId?: string;
  preferences?: UserPreferences;
  limit?: number;
  type?: "personalized" | "trending" | "similar" | "budget_friendly" | "top_rated";
  excludeIds?: string[];
  area?: string;
};

// ─── Get Recommendations ───
export async function getRecommendations(
  options: RecommendationOptions = {}
): Promise<Array<{
  id: string;
  name: string;
  area: string;
  locality: string;
  price: number;
  type: string;
  gender: string;
  rating: number;
  reviews: number;
  amenities: string[];
  matchScore: number;
  matchReason: string;
}>> {
  const {
    userId,
    preferences,
    limit = 10,
    type = "personalized",
    excludeIds = [],
    area,
  } = options;

  let userPrefs = preferences;

  // Get user preferences if userId provided
  if (userId && !userPrefs) {
    const { data } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();
    userPrefs = data;
  }

  // Fetch listings
  let listings = await fetchListings();

  // Filter out excluded
  if (excludeIds.length > 0) {
    listings = listings.filter((l) => !excludeIds.includes(l.id));
  }

  // Filter by area if specified
  if (area) {
    listings = listings.filter((l) => l.area.toLowerCase() === area.toLowerCase());
  }

  // Score and rank
  let scoredListings = listings.map((listing) => {
    const { score, reason } = calculateMatchScore(listing, userPrefs, type);
    return { ...listing, matchScore: score, matchReason: reason };
  });

  // Sort based on type
  switch (type) {
    case "trending":
      scoredListings.sort((a, b) => {
        const aTrending = a.reviews * 0.7 + a.rating * 20;
        const bTrending = b.reviews * 0.7 + b.rating * 20;
        return bTrending - aTrending;
      });
      break;

    case "top_rated":
      scoredListings.sort((a, b) => b.rating - a.rating);
      break;

    case "budget_friendly":
      scoredListings.sort((a, b) => a.price - b.price);
      break;

    case "similar":
      // Similar is handled by getSimilarListings in analytics.ts
      scoredListings.sort((a, b) => b.matchScore - a.matchScore);
      break;

    case "personalized":
    default:
      scoredListings.sort((a, b) => b.matchScore - a.matchScore);
      break;
  }

  return scoredListings.slice(0, limit);
}

// ─── Calculate Match Score ───
function calculateMatchScore(
  listing: {
    id: string;
    name: string;
    area: string;
    price: number;
    rating: number;
    reviews: number;
    amenities: string[];
    gender: string;
    type: string;
    furnished?: boolean;
    foodIncluded?: boolean;
    wifiIncluded?: boolean;
    acAvailable?: boolean;
  },
  prefs: UserPreferences | null | undefined,
  type: string
): { score: number; reason: string } {
  let score = 50; // Base score
  let reason = "Matches your criteria";

  if (!prefs) {
    // No preferences, return based on type
    if (type === "trending") {
      return { score: 50 + listing.reviews, reason: "Popular listing" };
    }
    if (type === "top_rated") {
      return { score: listing.rating * 20, reason: "Highly rated" };
    }
    if (type === "budget_friendly") {
      return { score: 100 - listing.price / 100, reason: "Good value" };
    }
    return { score: 50, reason: "Recommended for you" };
  }

  // Area matching
  if (prefs.preferred_areas?.length) {
    if (prefs.preferred_areas.includes(listing.area)) {
      score += 30;
      reason = `In your preferred area: ${listing.area}`;
    }
  }

  // Budget matching
  if (prefs.min_budget !== undefined && prefs.max_budget !== undefined) {
    if (listing.price >= prefs.min_budget && listing.price <= prefs.max_budget) {
      score += 25;
    } else if (listing.price < prefs.min_budget) {
      score += 10; // Below budget is okay
    } else {
      score -= 20; // Over budget is bad
    }
  }

  // Gender matching
  if (prefs.preferred_gender && prefs.preferred_gender !== "any") {
    if (listing.gender === prefs.preferred_gender || listing.gender === "coed") {
      score += 15;
    } else {
      score -= 30;
    }
  }

  // Room type preference
  if (prefs.room_type_pref && prefs.room_type_pref !== "any") {
    if (listing.type === prefs.room_type_pref) {
      score += 10;
    }
  }

  // Amenity matching
  if (prefs.preferred_amenities?.length) {
    const matchedAmenities = listing.amenities.filter((a) =>
      prefs.preferred_amenities!.some((pa) => a.toLowerCase().includes(pa.toLowerCase()))
    );
    const matchRatio = matchedAmenities.length / prefs.preferred_amenities.length;
    score += Math.round(matchRatio * 20);
  }

  // Rating bonus
  if (listing.rating >= 4.5) {
    score += 15;
    reason = "Excellent rating (4.5+)";
  } else if (listing.rating >= 4.0) {
    score += 10;
  } else if (listing.rating >= 3.5) {
    score += 5;
  }

  // Reviews bonus (more reviews = more reliable)
  score += Math.min(listing.reviews, 20);

  // Furnished bonus
  if (listing.furnished && prefs.lifestyle_preferences?.includes("furnished")) {
    score += 10;
  }

  // Food included bonus
  if (listing.foodIncluded && prefs.lifestyle_preferences?.includes("food_included")) {
    score += 10;
  }

  // WiFi bonus
  if (listing.wifiIncluded && prefs.lifestyle_preferences?.includes("wifi")) {
    score += 5;
  }

  // Cap score at 100
  score = Math.min(100, Math.max(0, score));

  return { score, reason };
}

// ─── Get Price-based Recommendations ───
export async function getBudgetFriendlyRecommendations(
  maxBudget: number,
  limit: number = 10
): Promise<Array<{ id: string; name: string; area: string; price: number; rating: number }>> {
  const listings = await fetchListings();

  return listings
    .filter((l) => l.price <= maxBudget)
    .sort((a, b) => {
      // Sort by rating first, then by price
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a.price - b.price;
    })
    .slice(0, limit)
    .map((l) => ({
      id: l.id,
      name: l.name,
      area: l.area,
      price: l.price,
      rating: l.rating,
    }));
}

// ─── Get Area Recommendations ───
export async function getAreaRecommendations(
  area: string,
  limit: number = 10
): Promise<Array<{
  id: string;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  bestValue: boolean;
}>> {
  const listings = await fetchListings();

  const areaListings = listings.filter(
    (l) => l.area.toLowerCase() === area.toLowerCase()
  );

  if (areaListings.length === 0) return [];

  const avgPrice = areaListings.reduce((sum, l) => sum + l.price, 0) / areaListings.length;

  return areaListings
    .sort((a, b) => {
      // Best value = high rating, low price relative to average
      const aValue = a.rating / (a.price / avgPrice);
      const bValue = b.rating / (b.price / avgPrice);
      return bValue - aValue;
    })
    .slice(0, limit)
    .map((l, index) => ({
      id: l.id,
      name: l.name,
      price: l.price,
      rating: l.rating,
      reviews: l.reviews,
      bestValue: index === 0,
    }));
}

// ─── Get Recently Viewed Recommendations ───
export async function getRecentlyViewedRecommendations(
  userId: string,
  limit: number = 10
): Promise<Array<{ id: string; name: string; area: string; price: number }>> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: behaviors } = await supabase
    .from("user_behavior")
    .select("pg_id")
    .eq("user_id", userId)
    .eq("action_type", "view")
    .gte("created_at", thirtyDaysAgo)
    .order("created_at", { ascending: false });

  if (!behaviors || behaviors.length === 0) return [];

  const viewedIds = [...new Set(behaviors.map((b) => b.pg_id))].slice(0, 20);
  const listings = await fetchListings();

  return viewedIds
    .map((id) => {
      const listing = listings.find((l) => l.id === id);
      if (listing) {
        return {
          id: listing.id,
          name: listing.name,
          area: listing.area,
          price: listing.price,
        };
      }
      return null;
    })
    .filter(Boolean) as Array<{ id: string; name: string; area: string; price: number }>;
}
