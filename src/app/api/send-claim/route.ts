import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isNonEmptyString, isValidUUID, sanitizeString } from "@/lib/validate";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), "send-claim", 15);
  if (limited) return limited;

  try {
    const { listing_id, listing_name, listing_area, claim_code, agent_id, agent_name, owner_id } = await req.json();

    if (!isNonEmptyString(listing_id)) {
      return NextResponse.json({ error: "listing_id is required" }, { status: 400 });
    }
    if (!isNonEmptyString(claim_code)) {
      return NextResponse.json({ error: "claim_code is required" }, { status: 400 });
    }
    if (!isNonEmptyString(agent_id)) {
      return NextResponse.json({ error: "agent_id is required" }, { status: 400 });
    }
    if (!isValidUUID(agent_id)) {
      return NextResponse.json({ error: "Invalid agent_id format. Must be a valid UUID." }, { status: 400 });
    }
    if (!isNonEmptyString(owner_id)) {
      return NextResponse.json({ error: "owner_id is required" }, { status: 400 });
    }
    if (!isValidUUID(owner_id)) {
      return NextResponse.json({ error: "Invalid owner_id format. Must be a valid UUID." }, { status: 400 });
    }

    // Sanitize optional text fields
    const safeListingName = listing_name ? sanitizeString(String(listing_name), 200) : "";
    const safeListingArea = listing_area ? sanitizeString(String(listing_area), 100) : "";
    const safeAgentName = agent_name ? sanitizeString(String(agent_name), 100) : "";
    const safeClaimCode = sanitizeString(claim_code, 50);

    // Check if already sent to this owner for this listing
    const { data: existing } = await supabase
      .from("claim_notifications")
      .select("id")
      .eq("listing_id", listing_id)
      .eq("owner_id", owner_id)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Claim already sent to this owner" }, { status: 400 });
    }

    const { error } = await supabase.from("claim_notifications").insert({
      listing_id,
      listing_name: safeListingName,
      listing_area: safeListingArea,
      claim_code: safeClaimCode,
      agent_id,
      agent_name: safeAgentName,
      owner_id,
    });

    if (error) {
      return NextResponse.json({ error: "Failed to send claim" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
