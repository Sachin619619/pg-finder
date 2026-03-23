import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isNonEmptyString, isValidUUID } from "@/lib/validate";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), "room-availability", 15);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { listing_id, owner_id, room_type, available } = body;

    if (!isNonEmptyString(listing_id)) {
      return NextResponse.json({ error: "listing_id is required" }, { status: 400 });
    }
    if (!isNonEmptyString(owner_id)) {
      return NextResponse.json({ error: "owner_id is required" }, { status: 400 });
    }
    if (!isValidUUID(owner_id)) {
      return NextResponse.json({ error: "Invalid owner_id format. Must be a valid UUID." }, { status: 400 });
    }
    if (!isNonEmptyString(room_type)) {
      return NextResponse.json({ error: "room_type is required" }, { status: 400 });
    }
    if (typeof available !== "boolean") {
      return NextResponse.json({ error: "available must be a boolean (true or false)" }, { status: 400 });
    }

    // Verify listing belongs to owner
    const { data: listing, error: findError } = await supabase
      .from("listings")
      .select("id, owner_id, room_options")
      .eq("id", listing_id)
      .single();

    if (findError || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.owner_id !== owner_id) {
      return NextResponse.json({ error: "Unauthorized: you do not own this listing" }, { status: 403 });
    }

    // Update the specific room type's availability
    const roomOptions = listing.room_options || [];
    const updatedRoomOptions = roomOptions.map(
      (r: { type: string; price: number; available: boolean }) =>
        r.type === room_type ? { ...r, available } : r
    );

    const { error: updateError } = await supabase
      .from("listings")
      .update({ room_options: updatedRoomOptions })
      .eq("id", listing_id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, room_options: updatedRoomOptions });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
