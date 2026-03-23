import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isNonEmptyString, isValidUUID, isValidPrice, isValidPhone, sanitizeString } from "@/lib/validate";
import { getAuthUserId, supabaseAdmin as supabase } from "@/lib/server-auth";

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), "edit-listing", 15);
  if (limited) return limited;

  // Verify auth
  const authUserId = await getAuthUserId(req);
  if (!authUserId) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { listing_id, owner_id, updates } = body;

    if (!isNonEmptyString(listing_id)) {
      return NextResponse.json({ error: "listing_id is required" }, { status: 400 });
    }
    if (!isNonEmptyString(owner_id)) {
      return NextResponse.json({ error: "owner_id is required" }, { status: 400 });
    }
    if (!isValidUUID(owner_id)) {
      return NextResponse.json({ error: "Invalid owner_id format. Must be a valid UUID." }, { status: 400 });
    }
    // Ensure authenticated user matches the claimed owner
    if (authUserId !== owner_id) {
      return NextResponse.json({ error: "Forbidden: you can only edit your own listings" }, { status: 403 });
    }

    if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
      return NextResponse.json({ error: "updates must be a non-empty object" }, { status: 400 });
    }

    // Validate specific update fields if present
    if (updates.name !== undefined) {
      if (!isNonEmptyString(updates.name)) {
        return NextResponse.json({ error: "name must be a non-empty string" }, { status: 400 });
      }
      updates.name = sanitizeString(updates.name, 200);
    }
    if (updates.description !== undefined && typeof updates.description === "string") {
      updates.description = sanitizeString(updates.description, 2000);
    }
    if (updates.price !== undefined && !isValidPrice(updates.price)) {
      return NextResponse.json({ error: "price must be a number between 500 and 200000" }, { status: 400 });
    }
    if (updates.contact_phone !== undefined) {
      if (!isNonEmptyString(updates.contact_phone) || !isValidPhone(updates.contact_phone)) {
        return NextResponse.json({ error: "Invalid contact_phone. Must be a valid 10-digit Indian mobile number." }, { status: 400 });
      }
    }

    // Verify the listing belongs to this owner
    const { data: listing, error: findError } = await supabase
      .from("listings")
      .select("id, owner_id")
      .eq("id", listing_id)
      .single();

    if (findError || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.owner_id !== owner_id) {
      return NextResponse.json({ error: "Unauthorized: you do not own this listing" }, { status: 403 });
    }

    // Build safe update object — only allow specific fields
    const allowedFields = [
      "name", "price", "description", "contact_phone",
      "amenities", "food_included", "wifi_included", "ac_available",
      "furnished", "available_from", "room_options",
    ];

    const safeUpdates: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        safeUpdates[key] = updates[key];
      }
    }

    // If room_options updated, also update the base price
    if (safeUpdates.room_options && Array.isArray(safeUpdates.room_options)) {
      const enabledRooms = (safeUpdates.room_options as { price: number; available: boolean }[])
        .filter(r => r.available);
      if (enabledRooms.length > 0) {
        // Validate each room option price
        for (const room of safeUpdates.room_options as { price: number; available: boolean }[]) {
          if (!isValidPrice(room.price)) {
            return NextResponse.json({ error: "Each room option price must be between 500 and 200000" }, { status: 400 });
          }
        }
        safeUpdates.price = Math.min(...enabledRooms.map(r => r.price));
      }
    }

    if (Object.keys(safeUpdates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("listings")
      .update(safeUpdates)
      .eq("id", listing_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
