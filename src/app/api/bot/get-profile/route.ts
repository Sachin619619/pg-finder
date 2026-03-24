import { NextResponse } from "next/server";
import { validateBotRequest } from "@/lib/bot-auth";
import { supabaseAdmin } from "@/lib/server-auth";

export async function POST(req: Request) {
  if (!validateBotRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userEmail } = await req.json();

    if (!userEmail) {
      return NextResponse.json({ error: "userEmail is required" }, { status: 400 });
    }

    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("id, name, email, phone, username, role, current_pg_id, created_at")
      .eq("email", userEmail)
      .single();

    if (error || !profile) {
      return NextResponse.json({
        success: false,
        message: `No account found for ${userEmail}. The user needs to sign up on Castle Living first.`,
      }, { status: 404 });
    }

    // Get stay requests
    const { data: requests } = await supabaseAdmin
      .from("resident_requests")
      .select("pg_name, status, created_at")
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false })
      .limit(5);

    // Get bookings
    const { data: bookings } = await supabaseAdmin
      .from("bookings")
      .select("pg_id, status, move_in_date, room_type, created_at")
      .eq("user_email", userEmail)
      .order("created_at", { ascending: false })
      .limit(5);

    // Get reviews
    const { data: reviews } = await supabaseAdmin
      .from("reviews")
      .select("pg_id, rating, comment, date")
      .eq("user_id", profile.id)
      .order("date", { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      profile: {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        username: profile.username,
        role: profile.role,
        currentPgId: profile.current_pg_id,
        memberSince: profile.created_at,
      },
      stayRequests: requests || [],
      bookings: bookings || [],
      reviews: reviews || [],
    });
  } catch (error) {
    console.error("Bot get-profile error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
