import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchListings } from "@/lib/db";

// GET /api/listings/[id]/verify - Get verification status
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Check listing_scores for verification info
    const { data: score, error } = await supabase
      .from("listing_scores")
      .select("*")
      .eq("pg_id", id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Get verification error:", error);
      return NextResponse.json({ error: "Failed to fetch verification" }, { status: 500 });
    }

    // Also check listing's own verification_status
    const listings = await fetchListings();
    const listing = listings.find((l) => l.id === id);

    return NextResponse.json({
      verification: {
        status: score?.verification_status || listing?.verification_status || 'unverified',
        flags: score?.verification_flags || [],
        lastVerifiedAt: score?.last_verified_at || null,
        nextVerificationDue: score?.next_verification_due || null,
        overallScore: score?.overall_score || null,
      }
    });
  } catch (error) {
    console.error("Get verification error:", error);
    return NextResponse.json({ error: "Failed to get verification" }, { status: 500 });
  }
}

// POST /api/listings/[id]/verify - Run automated verification
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

    // Run automated verification checks
    const verification = runVerificationChecks(listing);

    // Save verification results
    const { error } = await supabase
      .from("listing_scores")
      .upsert({
        pg_id: id,
        verification_status: verification.status,
        verification_flags: verification.flags,
        last_verified_at: new Date().toISOString(),
        next_verification_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        overall_score: verification.overallScore,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'pg_id'
      });

    if (error) {
      console.error("Save verification error:", error);
      return NextResponse.json({ error: "Failed to save verification" }, { status: 500 });
    }

    // Update listing verification status
    await supabase
      .from("listings")
      .update({ verification_status: verification.status })
      .eq("id", id);

    return NextResponse.json({
      success: true,
      verification: {
        status: verification.status,
        flags: verification.flags,
        score: verification.overallScore,
        checks: verification.checks,
      }
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json({ error: "Failed to verify listing" }, { status: 500 });
  }
}

function runVerificationChecks(listing: {
  name: string;
  price: number;
  rating: number;
  reviews: number;
  amenities: string[];
  description: string;
  contactPhone: string;
  images: string[];
  area?: string;
  locality?: string;
}) {
  const flags: string[] = [];
  const checks: Record<string, boolean> = {};

  // Check 1: Has complete information
  checks.hasName = !!listing.name && listing.name.length > 2;
  checks.hasPrice = listing.price > 0 && listing.price < 200000;
  checks.hasDescription = !!listing.description && listing.description.length > 20;
  checks.hasContact = !!listing.contactPhone && listing.contactPhone.length >= 10;
  checks.hasImages = listing.images && listing.images.length > 0;
  checks.hasLocation = !!listing.area && !!listing.locality;

  if (!checks.hasName) flags.push("missing_name");
  if (!checks.hasPrice) flags.push("invalid_price");
  if (!checks.hasDescription) flags.push("missing_description");
  if (!checks.hasContact) flags.push("missing_contact");
  if (!checks.hasImages) flags.push("missing_images");
  if (!checks.hasLocation) flags.push("missing_location");

  // Check 2: Realistic pricing
  checks.realisticPrice = listing.price >= 3000 && listing.price <= 100000;
  if (!checks.realisticPrice) flags.push("unrealistic_price");

  // Check 3: Has reviews or is new
  checks.hasReviews = listing.reviews > 0;
  checks.isVerifiedNew = !checks.hasReviews;

  // Check 4: Has required amenities
  const requiredAmenities = ['WiFi', 'Food', 'Security'];
  const hasRequired = requiredAmenities.filter((a) =>
    listing.amenities.some((la) => la.toLowerCase().includes(a.toLowerCase()))
  );
  checks.hasRequiredAmenities = hasRequired.length >= 2;
  if (!checks.hasRequiredAmenities) flags.push("missing_required_amenities");

  // Check 5: Rating quality
  checks.hasRating = listing.rating > 0;
  checks.goodRating = listing.rating >= 3.5;
  if (listing.reviews > 5 && listing.rating < 3.0) {
    flags.push("low_rating_with_reviews");
  }

  // Check 6: Phone number format
  checks.validPhone = /^[6-9]\d{9}$/.test(listing.contactPhone.replace(/\D/g, ''));
  if (!checks.validPhone) flags.push("invalid_phone_format");

  // Check 7: Description quality
  checks.goodDescription = listing.description.length > 50;
  if (!checks.goodDescription) flags.push("short_description");

  // Determine overall status
  let status: "verified" | "pending" | "needs_review" | "rejected" = "pending";

  if (flags.length === 0) {
    status = "verified";
  } else if (flags.includes("invalid_phone_format") || flags.includes("unrealistic_price")) {
    status = "rejected";
  } else if (flags.length > 3) {
    status = "needs_review";
  }

  // Calculate overall score
  const overallScore = (
    (checks.hasName ? 1 : 0) * 10 +
    (checks.hasPrice ? 1 : 0) * 10 +
    (checks.hasDescription ? 1 : 0) * 15 +
    (checks.hasContact ? 1 : 0) * 15 +
    (checks.hasImages ? 1 : 0) * 10 +
    (checks.hasLocation ? 1 : 0) * 10 +
    (checks.hasRequiredAmenities ? 1 : 0) * 15 +
    (checks.validPhone ? 1 : 0) * 15
  ) / 10;

  return {
    status,
    flags,
    checks,
    overallScore: Math.round(overallScore * 100) / 100,
  };
}
