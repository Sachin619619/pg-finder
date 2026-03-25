import { NextRequest, NextResponse } from "next/server";
import { fetchListings } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/compare - Compare multiple listings
export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "compare", 20);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { pgIds } = body;

    if (!pgIds || !Array.isArray(pgIds) || pgIds.length < 2) {
      return NextResponse.json(
        { error: "At least 2 PG IDs required" },
        { status: 400 }
      );
    }

    const listings = await fetchListings();
    const compareListings = listings.filter((l) => pgIds.includes(l.id));

    if (compareListings.length < 2) {
      return NextResponse.json(
        { error: "Not enough valid listings found" },
        { status: 404 }
      );
    }

    // Calculate comparison metrics
    const prices = compareListings.map((l) => l.price);
    const avgPrice = prices.reduce((s, p) => s + p, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const ratings = compareListings.map((l) => l.rating);
    const avgRating = ratings.reduce((s, r) => s + r, 0) / ratings.length;
    const maxRating = Math.max(...ratings);

    const reviews = compareListings.map((l) => l.reviews);
    const totalReviews = reviews.reduce((s, r) => s + r, 0);

    // Calculate scores
    const scoredListings = compareListings.map((listing) => {
      const score = {
        overall: 0,
        price: 0,
        rating: 0,
        amenities: 0,
        location: 0,
      };

      // Price score (lower is better)
      score.price = Math.max(0, 5 - ((listing.price - minPrice) / (maxPrice - minPrice || 1)) * 5);

      // Rating score
      score.rating = (listing.rating / maxRating) * 5;

      // Amenities score
      const importantAmenities = ["WiFi", "AC", "Food", "Security", "Power Backup", "CCTV"];
      const matchedCount = listing.amenities.filter((a) =>
        importantAmenities.some((ia) => a.toLowerCase().includes(ia.toLowerCase()))
      ).length;
      score.amenities = (matchedCount / importantAmenities.length) * 5;

      // Location score (could be enhanced with actual distance data)
      score.location = 3.5; // Default

      // Overall score
      score.overall = (
        score.price * 0.3 +
        score.rating * 0.3 +
        score.amenities * 0.25 +
        score.location * 0.15
      );

      return {
        ...listing,
        scores: {
          price: Math.round(score.price * 100) / 100,
          rating: Math.round(score.rating * 100) / 100,
          amenities: Math.round(score.amenities * 100) / 100,
          location: Math.round(score.location * 100) / 100,
          overall: Math.round(score.overall * 100) / 100,
        },
        priceDiff: listing.price - avgPrice,
        priceDiffPercent: Math.round(((listing.price - avgPrice) / avgPrice) * 100),
      };
    });

    // Find best in each category
    const winners = {
      price: scoredListings.reduce((best, l) =>
        !best || l.price < best.price ? l : best
      ),
      rating: scoredListings.reduce((best, l) =>
        !best || l.rating > best.rating ? l : best
      ),
      amenities: scoredListings.reduce((best, l) =>
        !best || l.amenities.length > best.amenities.length ? l : best
      ),
      overall: scoredListings.reduce((best, l) =>
        !best || l.scores.overall > best.scores.overall ? l : best
      ),
    };

    // Amenity comparison matrix
    const allAmenities = [...new Set(compareListings.flatMap((l) => l.amenities))].sort();
    const amenityMatrix = allAmenities.map((amenity) => {
      const row: Record<string, boolean | string> = { amenity };
      compareListings.forEach((pg) => {
        row[pg.id] = pg.amenities.some((a) => a.toLowerCase().includes(amenity.toLowerCase()));
      });
      return row;
    });

    return NextResponse.json({
      listings: scoredListings,
      winners: {
        price: { id: winners.price.id, name: winners.price.name },
        rating: { id: winners.rating.id, name: winners.rating.name },
        amenities: { id: winners.amenities.id, name: winners.amenities.name },
        overall: { id: winners.overall.id, name: winners.overall.name },
      },
      summary: {
        avgPrice: Math.round(avgPrice),
        avgRating: Math.round(avgRating * 10) / 10,
        totalReviews,
        priceRange: { min: minPrice, max: maxPrice },
      },
      amenityMatrix,
    });
  } catch (error) {
    console.error("Compare error:", error);
    return NextResponse.json({ error: "Comparison failed" }, { status: 500 });
  }
}

// GET /api/compare - Get comparison categories
export async function GET(req: NextRequest) {
  return NextResponse.json({
    categories: [
      { key: "price", label: "Price", unit: "₹/month", direction: "lower" },
      { key: "rating", label: "Rating", unit: "stars", direction: "higher" },
      { key: "amenities", label: "Amenities", unit: "count", direction: "higher" },
      { key: "overall", label: "Overall Score", unit: "score", direction: "higher" },
    ],
    tips: [
      "Compare up to 5 listings at a time",
      "Look for listings with high ratings and reasonable prices",
      "Check if essential amenities are included",
      "Consider location and transport accessibility",
    ],
  });
}
