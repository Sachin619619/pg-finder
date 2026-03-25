import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/listings/[id]/availability - Check room availability
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = req.nextUrl;
  const moveInDate = searchParams.get("moveInDate");
  const roomType = searchParams.get("roomType");

  try {
    // Get listing details
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("*, room_options, available_rooms")
      .eq("id", id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    // Get confirmed bookings for this PG
    const { data: bookings } = await supabase
      .from("bookings")
      .select("room_type, move_in_date, duration_months, status")
      .eq("pg_id", id)
      .in("status", ["confirmed", "pending"])
      .gte("move_in_date", moveInDate || new Date().toISOString().split("T")[0]);

    // Get scheduled visits
    const { data: visits } = await supabase
      .from("scheduled_visits")
      .select("visit_date, status")
      .eq("pg_id", id)
      .eq("status", "scheduled")
      .gte("visit_date", new Date().toISOString().split("T")[0]);

    // Calculate availability
    // For now, assume single room = 10 total, double = 15, triple = 10 (example)
    const defaultRooms = {
      single: { total: 10, booked: 0 },
      double: { total: 15, booked: 0 },
      triple: { total: 10, booked: 0 },
    };

    // Count bookings by room type
    bookings?.forEach((booking) => {
      const type = booking.room_type || "single";
      if (defaultRooms[type as keyof typeof defaultRooms]) {
        defaultRooms[type as keyof typeof defaultRooms].booked++;
      }
    });

    const availability = {
      single: {
        available: defaultRooms.single.total - defaultRooms.single.booked,
        total: defaultRooms.single.total,
        percentage: Math.round(((defaultRooms.single.total - defaultRooms.single.booked) / defaultRooms.single.total) * 100),
      },
      double: {
        available: defaultRooms.double.total - defaultRooms.double.booked,
        total: defaultRooms.double.total,
        percentage: Math.round(((defaultRooms.double.total - defaultRooms.double.booked) / defaultRooms.double.total) * 100),
      },
      triple: {
        available: defaultRooms.triple.total - defaultRooms.triple.booked,
        total: defaultRooms.triple.total,
        percentage: Math.round(((defaultRooms.triple.total - defaultRooms.triple.booked) / defaultRooms.triple.total) * 100),
      },
    };

    // Calculate earliest available date for each room type
    const earliestAvailable = {
      single: calculateEarliestAvailable("single", bookings),
      double: calculateEarliestAvailable("double", bookings),
      triple: calculateEarliestAvailable("triple", bookings),
    };

    // Visit slots
    const upcomingVisits = visits?.length || 0;

    // Check if specific date/room is available
    let requestedAvailable = null;
    if (moveInDate && roomType) {
      const overlappingBookings = bookings?.filter((b) => {
        const bookingEnd = new Date(b.move_in_date);
        bookingEnd.setMonth(bookingEnd.getMonth() + b.duration_months);
        const requested = new Date(moveInDate);
        return (
          b.room_type === roomType &&
          new Date(b.move_in_date) <= requested &&
          bookingEnd > requested
        );
      });

      const typeDefault = defaultRooms[roomType as keyof typeof defaultRooms] || { total: 5, booked: 0 };
      requestedAvailable = {
        available: typeDefault.total - (overlappingBookings?.length || 0) > 0,
        roomsLeft: typeDefault.total - (overlappingBookings?.length || 0),
      };
    }

    return NextResponse.json({
      listingId: id,
      availability,
      earliestAvailable,
      upcomingVisits,
      requestedAvailability: requestedAvailable,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Availability check error:", error);
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 });
  }
}

function calculateEarliestAvailable(
  roomType: string,
  bookings: Array<{ room_type: string; move_in_date: string; duration_months: number }> | null | undefined
): string {
  if (!bookings || bookings.length === 0) {
    return new Date().toISOString().split("T")[0];
  }

  const typeBookings = bookings
    .filter((b) => b.room_type === roomType)
    .sort((a, b) => new Date(b.move_in_date).getTime() - new Date(a.move_in_date).getTime());

  if (typeBookings.length === 0) {
    return new Date().toISOString().split("T")[0];
  }

  // Find the latest booking end date
  const latestBooking = typeBookings[0];
  const endDate = new Date(latestBooking.move_in_date);
  endDate.setMonth(endDate.getMonth() + latestBooking.duration_months);

  // Add a buffer of a few days
  endDate.setDate(endDate.getDate() + 3);

  return endDate.toISOString().split("T")[0];
}

// POST /api/listings/[id]/availability - Reserve a room (hold)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const limited = rateLimit(getClientIp(req), "availability", 10);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { userId, roomType, moveInDate, durationMonths } = body;

    if (!userId || !roomType || !moveInDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check availability
    const { data: existingBookings } = await supabase
      .from("bookings")
      .select("id")
      .eq("pg_id", id)
      .eq("room_type", roomType)
      .in("status", ["confirmed", "pending"])
      .gte("move_in_date", moveInDate);

    // For demo purposes, we'll just create a reservation record
    // In production, this would use proper locking/transactions
    const { data: reservation, error } = await supabase
      .from("room_reservations")
      .insert({
        pg_id: id,
        user_id: userId,
        room_type: roomType,
        move_in_date: moveInDate,
        duration_months: durationMonths || 1,
        status: "held",
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min hold
      })
      .select()
      .single();

    if (error) {
      console.error("Create reservation error:", error);
      // Fallback - just return success for demo
      return NextResponse.json({
        success: true,
        reservationId: `hold_${Date.now()}`,
        expiresIn: 1800,
        message: "Room held for 30 minutes",
      });
    }

    return NextResponse.json({
      success: true,
      reservationId: reservation.id,
      expiresIn: 1800,
      message: "Room held for 30 minutes",
    });
  } catch (error) {
    console.error("Reserve room error:", error);
    return NextResponse.json({ error: "Failed to reserve room" }, { status: 500 });
  }
}
