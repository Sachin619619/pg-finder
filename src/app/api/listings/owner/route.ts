import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/listings/owner - Get owner's listings
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const ownerId = searchParams.get("ownerId");

  if (!ownerId) {
    return NextResponse.json({ error: "Owner ID required" }, { status: 401 });
  }

  try {
    const { data: listings, error } = await supabase
      .from("listings")
      .select("*")
      .eq("owner_id", ownerId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get owner listings error:", error);
      return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
    }

    // Get analytics for each listing
    const listingsWithAnalytics = await Promise.all(
      (listings || []).map(async (listing) => {
        // Get view count from behavior
        const { count: views } = await supabase
          .from("user_behavior")
          .select("*", { count: "exact" })
          .eq("pg_id", listing.id)
          .eq("action_type", "view");

        // Get booking count
        const { count: bookings } = await supabase
          .from("bookings")
          .select("*", { count: "exact" })
          .eq("pg_id", listing.id)
          .eq("status", "confirmed");

        // Get visit count
        const { count: visits } = await supabase
          .from("scheduled_visits")
          .select("*", { count: "exact" })
          .eq("pg_id", listing.id)
          .eq("status", "completed");

        return {
          ...listing,
          analytics: {
            views: views || 0,
            bookings: bookings || 0,
            visits: visits || 0,
            conversionRate: views ? ((bookings || 0) / views * 100).toFixed(2) : "0.00",
          },
        };
      })
    );

    return NextResponse.json({ listings: listingsWithAnalytics });
  } catch (error) {
    console.error("Get owner listings error:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

// POST /api/listings/owner - Create new listing (owner)
export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "listings", 5);
  if (limited) return limited;

  try {
    const body = await req.json();
    const {
      ownerId,
      name,
      area,
      locality,
      price,
      type,
      gender,
      amenities,
      description,
      contactPhone,
      contactName,
      mapUrl,
      lat,
      lng,
      availableFrom,
      furnished,
      foodIncluded,
      wifiIncluded,
      acAvailable,
      nearbyLandmarks,
      distanceFromMetro,
      images,
    } = body;

    if (!ownerId || !name || !area || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate listing ID
    const id = `pg${Date.now()}`;

    // Insert listing
    const { data, error } = await supabase
      .from("listings")
      .insert({
        id,
        owner_id: ownerId,
        name,
        area,
        locality: locality || "",
        price,
        type: type || "single",
        gender: gender || "coed",
        amenities: amenities || [],
        description: description || "",
        contact_phone: contactPhone || "",
        contact_name: contactName || "",
        map_url: mapUrl || "",
        lat: lat || 0,
        lng: lng || 0,
        available_from: availableFrom || new Date().toISOString().split("T")[0],
        furnished: furnished || false,
        food_included: foodIncluded || false,
        wifi_included: wifiIncluded || false,
        ac_available: acAvailable || false,
        nearby_landmarks: nearbyLandmarks || [],
        distance_from_metro: distanceFromMetro,
        images: images || [],
        status: "active",
        verification_status: "unverified",
        rating: 0,
        reviews: 0,
        view_count: 0,
        search_count: 0,
        booking_count: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Create listing error:", error);
      return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
    }

    // Initialize listing score
    await supabase.from("listing_scores").insert({
      pg_id: id,
      verification_status: "pending",
      overall_score: 0,
    });

    return NextResponse.json({ success: true, listing: data });
  } catch (error) {
    console.error("Create listing error:", error);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}

// PUT /api/listings/owner - Update listing (owner)
export async function PUT(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "listings", 10);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { ownerId, listingId, ...updates } = body;

    if (!ownerId || !listingId) {
      return NextResponse.json({ error: "Owner ID and Listing ID required" }, { status: 400 });
    }

    // Verify ownership
    const { data: listing, error: fetchError } = await supabase
      .from("listings")
      .select("owner_id")
      .eq("id", listingId)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.owner_id !== ownerId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Map camelCase to snake_case
    const mappedUpdates: Record<string, unknown> = {};
    const fieldMap: Record<string, string> = {
      locality: "locality",
      contactPhone: "contact_phone",
      contactName: "contact_name",
      mapUrl: "map_url",
      availableFrom: "available_from",
      furnished: "furnished",
      foodIncluded: "food_included",
      wifiIncluded: "wifi_included",
      acAvailable: "ac_available",
      nearbyLandmarks: "nearby_landmarks",
      distanceFromMetro: "distance_from_metro",
      images: "images",
    };

    Object.entries(updates).forEach(([key, value]) => {
      const mappedKey = fieldMap[key] || key;
      mappedUpdates[mappedKey] = value;
    });

    // Update listing
    const { error } = await supabase
      .from("listings")
      .update(mappedUpdates)
      .eq("id", listingId);

    if (error) {
      console.error("Update listing error:", error);
      return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
    }

    // Reset verification if significant fields changed
    if (updates.price || updates.description || updates.amenities) {
      await supabase
        .from("listing_scores")
        .update({
          verification_status: "needs_review",
        })
        .eq("pg_id", listingId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update listing error:", error);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}

// DELETE /api/listings/owner - Delete listing (owner)
export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const ownerId = searchParams.get("ownerId");
  const listingId = searchParams.get("listingId");

  if (!ownerId || !listingId) {
    return NextResponse.json({ error: "Owner ID and Listing ID required" }, { status: 400 });
  }

  try {
    // Verify ownership
    const { data: listing, error: fetchError } = await supabase
      .from("listings")
      .select("owner_id")
      .eq("id", listingId)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.owner_id !== ownerId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Soft delete - set status to inactive
    const { error } = await supabase
      .from("listings")
      .update({ status: "inactive" })
      .eq("id", listingId);

    if (error) {
      console.error("Delete listing error:", error);
      return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete listing error:", error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
