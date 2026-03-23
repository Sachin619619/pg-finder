import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isNonEmptyString, isValidUUID } from "@/lib/validate";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), "accept-claim", 15);
  if (limited) return limited;

  try {
    const { notification_id, owner_id } = await req.json();

    if (!isNonEmptyString(notification_id)) {
      return NextResponse.json({ error: "notification_id is required" }, { status: 400 });
    }
    if (!isNonEmptyString(owner_id)) {
      return NextResponse.json({ error: "owner_id is required" }, { status: 400 });
    }
    if (!isValidUUID(owner_id)) {
      return NextResponse.json({ error: "Invalid owner_id format. Must be a valid UUID." }, { status: 400 });
    }

    // Get the notification
    const { data: notif, error: findError } = await supabase
      .from("claim_notifications")
      .select("*")
      .eq("id", notification_id)
      .eq("owner_id", owner_id)
      .single();

    if (findError || !notif) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    // Find the listing by claim code
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, owner_id")
      .eq("claim_code", notif.claim_code)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: "Listing not found or already claimed" }, { status: 404 });
    }

    if (listing.owner_id) {
      return NextResponse.json({ error: "This PG has already been claimed" }, { status: 400 });
    }

    // Claim the listing — assign owner, clear code, set status to pending
    const { error: updateError } = await supabase
      .from("listings")
      .update({ owner_id, claim_code: null, status: "pending" })
      .eq("id", listing.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to claim PG" }, { status: 500 });
    }

    // Mark notification as accepted
    await supabase
      .from("claim_notifications")
      .update({ status: "accepted" })
      .eq("id", notification_id);

    return NextResponse.json({ success: true, listing_name: notif.listing_name });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
