import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendNotification } from "@/lib/notifications";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET /api/bookings - Get user's bookings
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");
  const status = searchParams.get("status");
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 401 });
  }

  try {
    let query = supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq("status", status);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error("Get bookings error:", error);
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }

    // Enrich with listing details
    const enrichedBookings = await Promise.all(
      (bookings || []).map(async (booking) => {
        const { data: listing } = await supabase
          .from("listings")
          .select("name, area, images, rating")
          .eq("id", booking.pg_id)
          .single();

        return {
          ...booking,
          listing: listing ? {
            name: listing.name,
            area: listing.area,
            image: listing.images?.[0],
            rating: listing.rating,
          } : null,
        };
      })
    );

    // Get booking stats
    const { data: stats } = await supabase
      .from("bookings")
      .select("status")
      .eq("user_id", userId);

    const statusCounts = stats?.reduce((acc: Record<string, number>, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {}) || {};

    return NextResponse.json({
      bookings: enrichedBookings,
      stats: {
        total: stats?.length || 0,
        pending: statusCounts.pending || 0,
        confirmed: statusCounts.confirmed || 0,
        cancelled: statusCounts.cancelled || 0,
        completed: statusCounts.completed || 0,
      },
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

// POST /api/bookings - Create new booking
export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "booking", 10);
  if (limited) return limited;

  try {
    const body = await req.json();
    const {
      pgId,
      pgName,
      pgArea,
      pgPrice,
      userId,
      userName,
      userEmail,
      userPhone,
      moveInDate,
      roomType,
      durationMonths,
      notes,
    } = body;

    if (!pgId || !moveInDate) {
      return NextResponse.json({ error: "PG ID and move-in date required" }, { status: 400 });
    }

    // Verify user
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    // Create booking
    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        pg_id: pgId,
        user_id: userId,
        user_name: userName || "Guest",
        user_email: userEmail || "",
        user_phone: userPhone || "",
        move_in_date: moveInDate,
        room_type: roomType || "single",
        duration_months: durationMonths || 1,
        notes: notes || "",
        total_amount: pgPrice || 0,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Create booking error:", error);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    // Get listing details for notifications
    const { data: listing } = await supabase
      .from("listings")
      .select("contact_email, contact_name, contact_phone, owner_id")
      .eq("id", pgId)
      .single();

    // Track behavior
    await supabase.from("user_behavior").insert({
      user_id: userId,
      pg_id: pgId,
      action_type: "booking_start",
      metadata: { bookingId: booking.id },
    });

    // Send notification to owner
    if (listing?.contact_email) {
      await sendNotification({
        userId: listing.owner_id,
        type: "booking_confirmation",
        channel: "email",
        recipient: listing.contact_email,
        subject: `New Booking Request - ${pgName}`,
        content: `
          <h2>New Booking Request!</h2>
          <p><strong>PG:</strong> ${pgName}</p>
          <p><strong>Tenant:</strong> ${userName}</p>
          <p><strong>Phone:</strong> ${userPhone || "N/A"}</p>
          <p><strong>Email:</strong> ${userEmail || "N/A"}</p>
          <p><strong>Move-in:</strong> ${moveInDate}</p>
          <p><strong>Room:</strong> ${roomType}</p>
          <p><strong>Duration:</strong> ${durationMonths} month(s)</p>
        `,
        metadata: { bookingId: booking.id, pgId },
      });
    }

    // Send confirmation to user
    if (userEmail) {
      await sendNotification({
        userId,
        type: "booking_confirmation",
        channel: "email",
        recipient: userEmail,
        subject: "Booking Request Sent - Castle",
        content: `
          <h2>Booking Request Sent! 🎉</h2>
          <p>Your booking request for <strong>${pgName}</strong> has been sent to the owner.</p>
          <p><strong>Move-in Date:</strong> ${moveInDate}</p>
          <p>The owner will review your request and get back to you soon.</p>
        `,
        metadata: { bookingId: booking.id, pgId },
      });
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        status: booking.status,
        moveInDate: booking.move_in_date,
      },
    });
  } catch (error) {
    console.error("Create booking error:", error);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

// PUT /api/bookings - Update booking (cancel, etc.)
export async function PUT(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "booking", 10);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { bookingId, userId, action, ...updates } = body;

    if (!bookingId || !userId) {
      return NextResponse.json({ error: "Booking ID and User ID required" }, { status: 400 });
    }

    // Verify ownership
    const { data: booking } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("user_id", userId)
      .single();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (action === "cancel") {
      const { cancellationReason } = updates;

      const { error } = await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          cancellation_reason: cancellationReason || "User cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      if (error) {
        console.error("Cancel booking error:", error);
        return NextResponse.json({ error: "Failed to cancel booking" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Booking cancelled" });
    }

    if (action === "confirm") {
      // Owner confirming booking
      const { data: listing } = await supabase
        .from("listings")
        .select("owner_id")
        .eq("id", booking.pg_id)
        .single();

      if (listing?.owner_id !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }

      const { error } = await supabase
        .from("bookings")
        .update({
          status: "confirmed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingId);

      if (error) {
        console.error("Confirm booking error:", error);
        return NextResponse.json({ error: "Failed to confirm booking" }, { status: 500 });
      }

      // Track behavior
      await supabase.from("user_behavior").insert({
        user_id: userId,
        pg_id: booking.pg_id,
        action_type: "booking_complete",
        metadata: { bookingId },
      });

      // Send confirmation email
      if (booking.user_email) {
        await sendNotification({
          userId: booking.user_id,
          type: "booking_confirmation",
          channel: "email",
          recipient: booking.user_email,
          subject: "Booking Confirmed! - Castle",
          content: `
            <h2>Booking Confirmed! 🎉</h2>
            <p>Your booking has been confirmed by the owner.</p>
            <p><strong>Move-in Date:</strong> ${booking.move_in_date}</p>
            <p>Please contact the owner for further details.</p>
          `,
          metadata: { bookingId },
        });
      }

      return NextResponse.json({ success: true, message: "Booking confirmed" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Update booking error:", error);
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
  }
}
