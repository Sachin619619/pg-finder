import { NextResponse } from "next/server";
import { validateBotRequest } from "@/lib/bot-auth";
import { fetchListings } from "@/lib/db";
import { supabaseAdmin } from "@/lib/server-auth";

export async function POST(req: Request) {
  if (!validateBotRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const allListings = await fetchListings();

    // Get profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("name, current_pg_id, role")
      .eq("id", userId)
      .single();

    // Get resident requests
    const { data: requests } = await supabaseAdmin
      .from("resident_requests")
      .select("pg_name, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    // Get callbacks
    const { data: callbacks } = await supabaseAdmin
      .from("callbacks")
      .select("pg_id, name, phone, created_at")
      .eq("name", profile?.name || "")
      .order("created_at", { ascending: false })
      .limit(5);

    let currentPg: string | null = null;
    if (profile?.current_pg_id) {
      const pg = allListings.find((l) => l.id === profile.current_pg_id);
      currentPg = pg?.name || profile.current_pg_id;
    }

    const stayRequests = (requests || []).map((r) => ({
      pgName: r.pg_name,
      status: r.status,
      date: r.created_at,
    }));

    const callbackRequests = (callbacks || []).map((c) => {
      const pg = allListings.find((l) => l.id === c.pg_id);
      return {
        pgName: pg?.name || c.pg_id,
        date: c.created_at,
      };
    });

    return NextResponse.json({
      success: true,
      currentPg,
      stayRequests,
      callbackRequests,
      summary: buildSummary(currentPg, stayRequests, callbackRequests),
    });
  } catch (error) {
    console.error("Bot check-status error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

function buildSummary(
  currentPg: string | null,
  stayRequests: { pgName: string; status: string; date: string }[],
  callbackRequests: { pgName: string; date: string }[]
) {
  const parts: string[] = [];

  if (currentPg) {
    parts.push(`Current PG: ${currentPg}`);
  } else {
    parts.push("No current PG linked.");
  }

  const pending = stayRequests.filter((r) => r.status === "pending");
  const approved = stayRequests.filter((r) => r.status === "approved");

  if (approved.length > 0) {
    parts.push(
      `Approved stays: ${approved.map((r) => r.pgName).join(", ")}`
    );
  }
  if (pending.length > 0) {
    parts.push(
      `Pending requests: ${pending.map((r) => r.pgName).join(", ")}`
    );
  }
  if (callbackRequests.length > 0) {
    parts.push(
      `Recent callbacks: ${callbackRequests.map((r) => r.pgName).join(", ")}`
    );
  }

  if (stayRequests.length === 0 && callbackRequests.length === 0 && !currentPg) {
    return "No bookings, requests, or callbacks found.";
  }

  return parts.join(" | ");
}
