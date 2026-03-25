import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/refunds - Process refund request
export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "refunds", 5);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { bookingId, userId, reason, amount } = body;

    if (!bookingId || !userId) {
      return NextResponse.json({ error: "Booking ID and User ID required" }, { status: 400 });
    }

    // Verify booking exists and belongs to user
    const { data: booking } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("user_id", userId)
      .single();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if already cancelled
    if (booking.status === "cancelled") {
      return NextResponse.json({ error: "Booking already cancelled" }, { status: 400 });
    }

    // Check if refund already processed
    if (booking.payment_status === "refunded") {
      return NextResponse.json({ error: "Refund already processed" }, { status: 400 });
    }

    // Calculate refund amount based on cancellation policy
    const depositAmount = booking.deposit_amount || booking.total_amount * 0.5; // Assume 50% deposit
    const moveInDate = new Date(booking.move_in_date);
    const daysUntilMoveIn = Math.ceil((moveInDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;
    let refundPolicy = "";

    if (daysUntilMoveIn >= 14) {
      refundPercentage = 100;
      refundPolicy = "Full refund (cancelled 14+ days before move-in)";
    } else if (daysUntilMoveIn >= 7) {
      refundPercentage = 75;
      refundPolicy = "75% refund (cancelled 7-13 days before move-in)";
    } else if (daysUntilMoveIn >= 3) {
      refundPercentage = 50;
      refundPolicy = "50% refund (cancelled 3-6 days before move-in)";
    } else {
      refundPercentage = 0;
      refundPolicy = "No refund (cancelled less than 3 days before move-in)";
    }

    const refundAmount = Math.round((depositAmount * refundPercentage) / 100);

    // Create refund request record
    const { data: refundRequest, error } = await supabase
      .from("refund_requests")
      .insert({
        booking_id: bookingId,
        user_id: userId,
        amount: refundAmount,
        reason: reason || "User cancelled",
        status: refundAmount > 0 ? "pending" : "not_applicable",
        refund_policy: refundPolicy,
        requested_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Create refund request error:", error);
      return NextResponse.json({ error: "Failed to create refund request" }, { status: 500 });
    }

    // Update booking status
    await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancellation_reason: reason || "User cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    return NextResponse.json({
      success: true,
      refund: {
        id: refundRequest.id,
        amount: refundAmount,
        policy: refundPolicy,
        status: refundAmount > 0 ? "pending" : "not_applicable",
      },
    });
  } catch (error) {
    console.error("Refund error:", error);
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 });
  }
}

// GET /api/refunds - Get refund status
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const refundId = searchParams.get("refundId");
  const bookingId = searchParams.get("bookingId");

  try {
    let query = supabase.from("refund_requests").select("*");

    if (refundId) {
      query = query.eq("id", refundId);
    } else if (bookingId) {
      query = query.eq("booking_id", bookingId);
    } else {
      return NextResponse.json({ error: "Refund ID or Booking ID required" }, { status: 400 });
    }

    const { data: refund, error } = await query.single();

    if (error) {
      console.error("Get refund error:", error);
      return NextResponse.json({ error: "Failed to fetch refund" }, { status: 500 });
    }

    return NextResponse.json({ refund });
  } catch (error) {
    console.error("Get refund error:", error);
    return NextResponse.json({ error: "Failed to fetch refund" }, { status: 500 });
  }
}

// PUT /api/refunds - Admin/process refund (approve/reject)
export async function PUT(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const apiKey = searchParams.get("apiKey");

  if (apiKey !== process.env.ADMIN_API_KEY && apiKey !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { refundId, action, transactionId } = body;

    if (!refundId || !action) {
      return NextResponse.json({ error: "Refund ID and action required" }, { status: 400 });
    }

    const { data: refund } = await supabase
      .from("refund_requests")
      .select("*")
      .eq("id", refundId)
      .single();

    if (!refund) {
      return NextResponse.json({ error: "Refund not found" }, { status: 404 });
    }

    if (action === "approve") {
      // In production, this would integrate with payment gateway
      await supabase
        .from("refund_requests")
        .update({
          status: "approved",
          transaction_id: transactionId || `REF_${Date.now()}`,
          processed_at: new Date().toISOString(),
        })
        .eq("id", refundId);

      // Update booking payment status
      await supabase
        .from("bookings")
        .update({ payment_status: "refunded" })
        .eq("id", refund.booking_id);

      return NextResponse.json({ success: true, message: "Refund approved" });
    }

    if (action === "reject") {
      await supabase
        .from("refund_requests")
        .update({
          status: "rejected",
          processed_at: new Date().toISOString(),
        })
        .eq("id", refundId);

      return NextResponse.json({ success: true, message: "Refund rejected" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Process refund error:", error);
    return NextResponse.json({ error: "Failed to process refund" }, { status: 500 });
  }
}
