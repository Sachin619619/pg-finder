import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isNonEmptyString, isValidUUID, isValidEmail, sanitizeString } from "@/lib/validate";
import { getAuthUserId, supabaseAdmin as supabase } from "@/lib/server-auth";

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), "select-pg:post", 15);
  if (limited) return limited;

  const authUserId = await getAuthUserId(req);
  if (!authUserId) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }

  try {
    const { user_id, user_name, user_email, pg_id } = await req.json();

    // Ensure authenticated user matches claimed user_id
    if (authUserId !== user_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!isNonEmptyString(user_id)) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }
    if (!isValidUUID(user_id)) {
      return NextResponse.json({ error: "Invalid user_id format. Must be a valid UUID." }, { status: 400 });
    }
    if (!isNonEmptyString(pg_id)) {
      return NextResponse.json({ error: "pg_id is required" }, { status: 400 });
    }
    if (user_email && typeof user_email === "string" && user_email.length > 0 && !isValidEmail(user_email)) {
      return NextResponse.json({ error: "Invalid user_email format" }, { status: 400 });
    }

    const safeName = user_name ? sanitizeString(String(user_name), 200) : "User";
    const safeEmail = user_email ? sanitizeString(String(user_email), 254) : "";

    // Verify listing exists and has an owner
    const { data: listing, error: findError } = await supabase
      .from("listings")
      .select("id, name, area, owner_id")
      .eq("id", pg_id)
      .single();

    if (findError || !listing) {
      return NextResponse.json({ error: "PG not found" }, { status: 404 });
    }

    if (!listing.owner_id) {
      return NextResponse.json({ error: "This PG doesn't have an owner yet. Cannot send request." }, { status: 400 });
    }

    // Check if there's already a pending/approved request
    const { data: existing } = await supabase
      .from("resident_requests")
      .select("id, status")
      .eq("user_id", user_id)
      .eq("pg_id", pg_id)
      .neq("status", "rejected")
      .single();

    if (existing) {
      if (existing.status === "approved") {
        return NextResponse.json({ error: "You are already linked to this PG." }, { status: 400 });
      }
      return NextResponse.json({ error: "Request already sent. Waiting for owner approval." }, { status: 400 });
    }

    // Create resident request
    const { error: insertError } = await supabase
      .from("resident_requests")
      .insert({
        user_id,
        user_name: safeName,
        user_email: safeEmail,
        pg_id,
        pg_name: listing.name,
        owner_id: listing.owner_id,
        status: "pending",
      });

    if (insertError) {
      return NextResponse.json({ error: "Failed to send request. Please try again." }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: "pending" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// GET: Check current request status for a user+pg combo
export async function GET(req: Request) {
  const limited = rateLimit(getClientIp(req), "select-pg:get", 30);
  if (limited) return limited;

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");
    const pgId = searchParams.get("pg_id");

    if (!userId || !pgId) {
      return NextResponse.json({ status: null });
    }
    if (!isValidUUID(userId)) {
      return NextResponse.json({ error: "Invalid user_id format. Must be a valid UUID." }, { status: 400 });
    }

    const { data } = await supabase
      .from("resident_requests")
      .select("id, status, created_at")
      .eq("user_id", userId)
      .eq("pg_id", pgId)
      .neq("status", "rejected")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    // Also check if already linked via profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("current_pg_id")
      .eq("id", userId)
      .single();

    return NextResponse.json({
      request: data || null,
      isLinked: profile?.current_pg_id === pgId,
    });
  } catch {
    return NextResponse.json({ request: null, isLinked: false });
  }
}

// DELETE: Remove user from their current PG
export async function DELETE(req: Request) {
  const limited = rateLimit(getClientIp(req), "select-pg:delete", 15);
  if (limited) return limited;

  const authUserId = await getAuthUserId(req);
  if (!authUserId) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }

  try {
    const { user_id, pg_id } = await req.json();

    // Ensure authenticated user matches claimed user_id
    if (authUserId !== user_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!isNonEmptyString(user_id)) {
      return NextResponse.json({ error: "user_id is required" }, { status: 400 });
    }
    if (!isValidUUID(user_id)) {
      return NextResponse.json({ error: "Invalid user_id format. Must be a valid UUID." }, { status: 400 });
    }

    // Clear current_pg_id from profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ current_pg_id: null })
      .eq("id", user_id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to remove" }, { status: 500 });
    }

    // Update resident request to rejected so they can re-request later
    if (pg_id) {
      await supabase
        .from("resident_requests")
        .update({ status: "rejected" })
        .eq("user_id", user_id)
        .eq("pg_id", pg_id)
        .eq("status", "approved");
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
