import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isNonEmptyString } from "@/lib/validate";
import { sendCallbackNotification } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), "booking", 10);
  if (limited) return limited;

  try {
    const body = await req.json();
    const {
      pg_id, pg_name, pg_area, pg_price,
      user_name, user_email, user_phone,
      move_in_date, room_type, duration_months, notes,
    } = body;

    if (!isNonEmptyString(pg_id) || !isNonEmptyString(move_in_date)) {
      return NextResponse.json({ error: "PG ID and move-in date are required" }, { status: 400 });
    }

    // Get auth user from header
    const authHeader = req.headers.get("authorization");
    let userId = null;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id;
    }

    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Save booking as pending
    const { error: insertError } = await supabase.from("bookings").insert({
      pg_id,
      user_id: userId,
      user_name: user_name || "Guest",
      user_email: user_email || "",
      user_phone: user_phone || "",
      move_in_date,
      room_type: room_type || "single",
      duration_months: duration_months || 1,
      notes: notes || "",
      total_amount: pg_price || 0,
      status: "pending",
    });

    if (insertError) {
      console.error("Booking insert error:", insertError);
      return NextResponse.json({ error: "Failed to save booking" }, { status: 500 });
    }

    // Get owner details from listing
    const { data: listing } = await supabase
      .from("listings")
      .select("contact_email, contact_name, contact_phone, owner_id")
      .eq("id", pg_id)
      .single();

    // Send email notification to owner
    if (listing?.contact_email) {
      sendCallbackNotification(
        listing.contact_email,
        listing.contact_name || "Owner",
        user_name || "A tenant",
        user_phone || user_email || "N/A",
        pg_name || "your PG"
      ).catch(() => {});
    }

    // Build WhatsApp message for owner
    let ownerWhatsApp = null;
    if (listing?.contact_phone) {
      const msg = `🔔 *New Booking Request*\n\n🏠 *PG:* ${pg_name}\n📍 *Area:* ${pg_area}\n👤 *Tenant:* ${user_name}\n📞 *Phone:* ${user_phone || "N/A"}\n📧 *Email:* ${user_email || "N/A"}\n📅 *Move-in:* ${move_in_date}\n🛏️ *Room:* ${room_type}\n⏳ *Duration:* ${duration_months} month(s)\n💬 *Note:* ${notes || "None"}\n\nPlease check your Castle owner dashboard to accept or reject.`;
      ownerWhatsApp = `https://wa.me/91${listing.contact_phone}?text=${encodeURIComponent(msg)}`;
    }

    return NextResponse.json({
      success: true,
      message: "Booking request sent to owner",
      ownerWhatsApp,
    });
  } catch (err) {
    console.error("Booking API error:", err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
