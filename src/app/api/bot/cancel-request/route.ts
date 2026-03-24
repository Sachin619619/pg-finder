import { NextResponse } from "next/server";
import { validateBotRequest } from "@/lib/bot-auth";
import { supabaseAdmin } from "@/lib/server-auth";

export async function POST(req: Request) {
  if (!validateBotRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userEmail, pgName, requestType } = await req.json();

    if (!userEmail) {
      return NextResponse.json({ error: "userEmail is required" }, { status: 400 });
    }

    const type = requestType || "stay"; // "stay" or "booking"

    if (type === "booking") {
      const query = supabaseAdmin
        .from("bookings")
        .select("id, pg_id, status")
        .eq("user_email", userEmail)
        .in("status", ["pending", "confirmed"]);

      if (pgName) query.ilike("pg_id", `%${pgName}%`);

      const { data: bookings } = await query.order("created_at", { ascending: false }).limit(1);

      if (!bookings?.length) {
        return NextResponse.json({
          success: false,
          message: pgName
            ? `No active booking found for "${pgName}".`
            : "No active bookings found.",
        });
      }

      const booking = bookings[0];
      const { error } = await supabaseAdmin
        .from("bookings")
        .update({ status: "cancelled" })
        .eq("id", booking.id);

      if (error) {
        return NextResponse.json({ success: false, message: "Failed to cancel booking." }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Booking for ${booking.pg_id} has been cancelled.`,
      });
    }

    // Default: cancel stay request
    const query = supabaseAdmin
      .from("resident_requests")
      .select("id, pg_name, status")
      .eq("user_email", userEmail)
      .eq("status", "pending");

    if (pgName) query.ilike("pg_name", `%${pgName}%`);

    const { data: requests } = await query.order("created_at", { ascending: false }).limit(1);

    if (!requests?.length) {
      return NextResponse.json({
        success: false,
        message: pgName
          ? `No pending stay request found for "${pgName}".`
          : "No pending stay requests found.",
      });
    }

    const request = requests[0];
    const { error } = await supabaseAdmin
      .from("resident_requests")
      .update({ status: "rejected" })
      .eq("id", request.id);

    if (error) {
      return NextResponse.json({ success: false, message: "Failed to cancel request." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Stay request for ${request.pg_name} has been cancelled.`,
    });
  } catch (error) {
    console.error("Bot cancel-request error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
