import { NextRequest, NextResponse } from "next/server";
import { fetchListings } from "@/lib/db";

// GET /api/og/[id] - Generate OG image URL for a listing
// Note: For actual image generation, you would use a service like Vercel OG, Cloudinary, etc.
// This endpoint returns the metadata needed for social sharing
export async function GET(
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

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://castleliving.in";

    // OG Image URL (would need actual image generation service)
    const ogImageUrl = `${baseUrl}/og/${id}.png`;

    // OG Meta tags for embedding
    const meta = {
      title: `${listing.name} - ₹${listing.price?.toLocaleString()}/month | Castle Living`,
      description: `${listing.type === "single" ? "Single" : listing.type === "double" ? "Double" : "Triple"} room in ${listing.area}. ${listing.foodIncluded ? "Food included" : ""} ${listing.wifiIncluded ? "WiFi" : ""} ${listing.acAvailable ? "AC" : ""}. ⭐ ${listing.rating} (${listing.reviews} reviews)`,
      keywords: `${listing.name}, PG in ${listing.area}, paying guest ${listing.area}, room for rent ${listing.area}`,
      ogImage: ogImageUrl,
      ogUrl: `${baseUrl}/listing/${id}`,
      ogType: "website",
      twitterCard: "summary_large_image",
      twitterTitle: `${listing.name} - Castle Living`,
      twitterDescription: `₹${listing.price?.toLocaleString()}/month in ${listing.area}`,
    };

    return NextResponse.json({
      listing: {
        id: listing.id,
        name: listing.name,
        area: listing.area,
        price: listing.price,
        rating: listing.rating,
        reviews: listing.reviews,
        type: listing.type,
        gender: listing.gender,
        amenities: listing.amenities.slice(0, 5),
        image: listing.images?.[0] || null,
      },
      meta,
      shareUrl: `${baseUrl}/listing/${id}`,
    });
  } catch (error) {
    console.error("OG data error:", error);
    return NextResponse.json({ error: "Failed to fetch OG data" }, { status: 500 });
  }
}
