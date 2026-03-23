import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isNonEmptyString, isValidUUID } from "@/lib/validate";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), "resident-action", 15);
  if (limited) return limited;

  try {
    const { request_id, action, owner_id } = await req.json();

    if (!isNonEmptyString(request_id)) {
      return NextResponse.json({ error: "request_id is required" }, { status: 400 });
    }
    if (!isNonEmptyString(action)) {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }
    if (!isNonEmptyString(owner_id)) {
      return NextResponse.json({ error: "owner_id is required" }, { status: 400 });
    }
    if (!isValidUUID(owner_id)) {
      return NextResponse.json({ error: "Invalid owner_id format. Must be a valid UUID." }, { status: 400 });
    }
    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "action must be one of: approved, rejected" }, { status: 400 });
    }

    // Fetch the request
    const { data: request, error: findError } = await supabase
      .from("resident_requests")
      .select("*")
      .eq("id", request_id)
      .single();

    if (findError || !request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Verify the owner owns this PG
    if (request.owner_id !== owner_id) {
      return NextResponse.json({ error: "You don't own this PG" }, { status: 403 });
    }

    // Update request status
    const { error: updateError } = await supabase
      .from("resident_requests")
      .update({ status: action })
      .eq("id", request_id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
    }

    // If approved, link the tenant to the PG
    if (action === "approved") {
      await supabase
        .from("profiles")
        .update({ current_pg_id: request.pg_id })
        .eq("id", request.user_id);
    }

    return NextResponse.json({ success: true, status: action });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
