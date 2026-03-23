import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isNonEmptyString, isValidUUID, sanitizeString } from "@/lib/validate";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), "claim-pg", 15);
  if (limited) return limited;

  try {
    const { claim_code, owner_id } = await req.json();

    if (!isNonEmptyString(claim_code)) {
      return NextResponse.json({ error: "claim_code is required" }, { status: 400 });
    }
    if (!isNonEmptyString(owner_id)) {
      return NextResponse.json({ error: "owner_id is required" }, { status: 400 });
    }
    if (!isValidUUID(owner_id)) {
      return NextResponse.json({ error: "Invalid owner_id format. Must be a valid UUID." }, { status: 400 });
    }
    const safeClaimCode = sanitizeString(claim_code, 50).toUpperCase().trim();
    if (safeClaimCode.length < 3) {
      return NextResponse.json({ error: "claim_code must be at least 3 characters" }, { status: 400 });
    }

    // Find listing with this claim code
    const { data: listing, error: findError } = await supabase
      .from("listings")
      .select("id, name, area, owner_id, claim_code")
      .eq("claim_code", safeClaimCode)
      .single();

    if (findError || !listing) {
      return NextResponse.json({ error: "Invalid claim code. Please check and try again." }, { status: 404 });
    }

    // Check if already claimed
    if (listing.owner_id) {
      return NextResponse.json({ error: "This PG has already been claimed by an owner." }, { status: 400 });
    }

    // Assign owner and activate listing (move from agent_draft to pending for review)
    const { error: updateError } = await supabase
      .from("listings")
      .update({ owner_id, claim_code: null, status: "pending" })
      .eq("id", listing.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to claim PG. Please try again." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      listing: { id: listing.id, name: listing.name, area: listing.area },
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
