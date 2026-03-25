import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchListings } from "@/lib/db";

// GET /api/listings/[id]/score - Get listing quality score
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Get existing score
    const { data: existingScore, error } = await supabase
      .from("listing_scores")
      .select("*")
      .eq("pg_id", id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Get score error:", error);
      return NextResponse.json({ error: "Failed to fetch score" }, { status: 500 });
    }

    if (existingScore) {
      return NextResponse.json({ score: existingScore });
    }

    // Calculate score on-the-fly
    const listings = await fetchListings();
    const listing = listings.find((l) => l.id === id);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const score = calculateListingScore(listing);

    return NextResponse.json({ score, calculated: true });
  } catch (error) {
    console.error("Get score error:", error);
    return NextResponse.json({ error: "Failed to get score" }, { status: 500 });
  }
}

function calculateListingScore(listing: {
  price: number;
  rating: number;
  reviews: number;
  amenities: string[];
  furnished?: boolean;
  foodIncluded?: boolean;
  wifiIncluded?: boolean;
  acAvailable?: boolean;
  area?: string;
}) {
  // Price score (lower price = higher score, adjusted for area)
  const basePrice = 15000;
  const priceScore = Math.max(0, Math.min(5, 5 - ((listing.price - basePrice) / basePrice) * 2));

  // Amenity score
  const importantAmenities = ['WiFi', 'AC', 'Food', 'Power Backup', 'Security', 'CCTV', 'Hot Water'];
  const matchedAmenities = listing.amenities.filter((a) =>
    importantAmenities.some((ia) => a.toLowerCase().includes(ia.toLowerCase()))
  ).length;
  const amenityScore = (matchedAmenities / importantAmenities.length) * 5;

  // Rating score
  const ratingScore = Math.min(5, listing.rating);

  // Reviews score (more reviews = more reliable score)
  const reviewsScore = Math.min(5, (listing.reviews / 50) * 5);

  // Location score (would need actual metro/transit data)
  const locationScore = 3.5; // Default

  // Overall score
  const overallScore = (
    priceScore * 0.2 +
    amenityScore * 0.25 +
    ratingScore * 0.25 +
    reviewsScore * 0.15 +
    locationScore * 0.15
  );

  return {
    overall_score: Math.round(overallScore * 100) / 100,
    price_score: Math.round(priceScore * 100) / 100,
    amenity_score: Math.round(amenityScore * 100) / 100,
    rating_score: Math.round(ratingScore * 100) / 100,
    reviews_score: Math.round(reviewsScore * 100) / 100,
    location_score: Math.round(locationScore * 100) / 100,
    calculated_at: new Date().toISOString(),
  };
}

// POST /api/listings/[id]/score - Recalculate and save score
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const listings = await fetchListings();
    const listing = listings.find((l) => l.id === id);

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const score = calculateListingScore(listing);

    // Save or update score
    const { error } = await supabase
      .from("listing_scores")
      .upsert({
        pg_id: id,
        overall_score: score.overall_score,
        price_score: score.price_score,
        amenity_score: score.amenity_score,
        location_score: score.location_score,
        hygiene_score: score.rating_score, // Use rating as proxy
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'pg_id'
      });

    if (error) {
      console.error("Save score error:", error);
      return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
    }

    return NextResponse.json({ success: true, score });
  } catch (error) {
    console.error("Save score error:", error);
    return NextResponse.json({ error: "Failed to save score" }, { status: 500 });
  }
}
