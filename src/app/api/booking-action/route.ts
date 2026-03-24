import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isNonEmptyString, isValidUUID } from "@/lib/validate";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), "booking-action", 15);
  if (limited) return limited;

  try {
    const { booking_id, action, owner_id } = await req.json();

    if (!isNonEmptyString(booking_id)) {
      return NextResponse.json({ error: "booking_id is required" }, { status: 400 });
    }
    if (!isNonEmptyString(action) || !["confirmed", "cancelled"].includes(action)) {
      return NextResponse.json({ error: "action must be 'confirmed' or 'cancelled'" }, { status: 400 });
    }
    if (!isNonEmptyString(owner_id) || !isValidUUID(owner_id)) {
      return NextResponse.json({ error: "Valid owner_id is required" }, { status: 400 });
    }

    // Fetch the booking
    const { data: booking, error: findError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single();

    if (findError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify the owner owns this PG
    const { data: listing } = await supabase
      .from("listings")
      .select("owner_id")
      .eq("id", booking.pg_id)
      .single();

    if (!listing || listing.owner_id !== owner_id) {
      return NextResponse.json({ error: "You don't own this PG" }, { status: 403 });
    }

    // Update booking status
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: action })
      .eq("id", booking_id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: action });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
