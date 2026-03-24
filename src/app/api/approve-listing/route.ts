import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendListingApproved, sendListingRejected } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "approve-listing", 15);
  if (limited) return limited;

  try {
    const { listingId, action, reason } = await req.json();

    if (!listingId || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request. Requires listingId and action (approve|reject)." }, { status: 400 });
    }

    // Check listing exists
    const { data: listing, error: fetchError } = await supabase
      .from("listings")
      .select("id, name, status, contact_email, contact_name")
      .eq("id", listingId)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    }

    const newStatus = action === "approve" ? "active" : "rejected";

    const { error: updateError } = await supabase
      .from("listings")
      .update({ status: newStatus })
      .eq("id", listingId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Send email notification to owner (non-blocking)
    if (listing.contact_email) {
      const ownerName = listing.contact_name || "Owner";
      const pgName = listing.name || "your listing";
      if (action === "approve") {
        sendListingApproved(listing.contact_email, ownerName, pgName).catch(() => {});
      } else {
        sendListingRejected(listing.contact_email, ownerName, pgName, reason).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      listingId,
      action,
      status: newStatus,
      message: `Listing "${listing.name}" has been ${action === "approve" ? "approved" : "rejected"}.`,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
