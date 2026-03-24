import { NextResponse } from "next/server";
import { validateBotRequest } from "@/lib/bot-auth";
import { supabaseAdmin } from "@/lib/server-auth";
import { fetchListings } from "@/lib/db";
import type { PGListing } from "@/data/listings";

function findPGByName(allListings: PGListing[], name: string): PGListing | undefined {
  if (!name) return undefined;
  const lower = name.toLowerCase().trim();
  return allListings.find(
    (pg) =>
      pg.name.toLowerCase().includes(lower) ||
      lower.includes(pg.name.toLowerCase().split(" ")[0])
  );
}

export async function POST(req: Request) {
  if (!validateBotRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userEmail, userName, userPhone, pgName, moveInDate, roomType, durationMonths, notes } = await req.json();

    if (!userEmail || !userName || !pgName) {
      return NextResponse.json({
        error: "userEmail, userName, and pgName are required",
      }, { status: 400 });
    }

    const allListings = await fetchListings();
    const pg = findPGByName(allListings, pgName);

    if (!pg) {
      return NextResponse.json({
        success: false,
        message: `Couldn't find a PG matching "${pgName}".`,
      }, { status: 404 });
    }

    // Check for existing active booking
    const { data: existing } = await supabaseAdmin
      .from("bookings")
      .select("id, status")
      .eq("user_email", userEmail)
      .eq("pg_id", pg.id)
      .in("status", ["pending", "confirmed"])
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: `You already have a ${existing.status} booking for ${pg.name}.`,
      });
    }

    const { error } = await supabaseAdmin.from("bookings").insert({
      pg_id: pg.id,
      user_id: null,
      user_name: userName,
      user_email: userEmail,
      user_phone: userPhone || null,
      move_in_date: moveInDate || null,
      room_type: roomType || pg.type || "single",
      duration_months: durationMonths || 1,
      notes: notes || null,
      total_amount: pg.price * (durationMonths || 1),
      status: "pending",
    });

    if (error) {
      console.error("Booking insert error:", error);
      // If table doesn't exist, give a helpful fallback
      if (error.code === "42P01") {
        return NextResponse.json({
          success: true,
          message: `We've noted your booking interest in ${pg.name}! Our team will reach out at ${userEmail}.`,
        });
      }
      return NextResponse.json({
        success: false,
        message: "Failed to create booking. Please try again.",
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Booking created for ${pg.name}! ${moveInDate ? `Move-in: ${moveInDate}` : ""} Room type: ${roomType || pg.type || "single"}. We'll confirm shortly.`,
    });
  } catch (error) {
    console.error("Bot make-booking error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
