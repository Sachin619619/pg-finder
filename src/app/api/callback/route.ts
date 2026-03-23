import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isNonEmptyString, isValidPhone, isValidUUID, sanitizeString } from "@/lib/validate";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { sendCallbackNotification } from "@/lib/email";

export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "callback", 15);
  if (limited) return limited;

  const body = await req.json();
  const { pgId, name, phone, timePreference } = body;

  // ── Validation ──
  if (!isNonEmptyString(pgId)) {
    return NextResponse.json({ error: "pgId is required" }, { status: 400 });
  }
  if (!isNonEmptyString(name)) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (!isNonEmptyString(phone)) {
    return NextResponse.json({ error: "phone is required" }, { status: 400 });
  }
  if (!isValidPhone(phone)) {
    return NextResponse.json({ error: "Invalid phone number. Must be a valid 10-digit Indian mobile number." }, { status: 400 });
  }

  // Sanitize text inputs
  const safeName = sanitizeString(name, 100);
  const safeTimePreference = timePreference ? sanitizeString(timePreference, 100) : undefined;

  if (safeName.length < 2) {
    return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
  }

  // 1. Save callback to DB
  const { error } = await supabase
    .from("callbacks")
    .insert({ pg_id: pgId, name: safeName, phone, time_preference: safeTimePreference });

  if (error) {
    return NextResponse.json({ error: "Failed to save callback" }, { status: 500 });
  }

  // 2. Get PG details for owner notification
  const { data: listing } = await supabase
    .from("listings")
    .select("name, contact_phone, contact_name, contact_email")
    .eq("id", pgId)
    .single();

  // 3. Send email notification to PG owner (non-blocking)
  if (listing?.contact_email) {
    sendCallbackNotification(
      listing.contact_email,
      listing.contact_name || "Owner",
      safeName,
      phone,
      listing.name || "your PG"
    ).catch(() => {});
  }

  // 4. Send WhatsApp notification to PG owner via wa.me redirect URL
  // (In production, use WhatsApp Business API or Twilio for automated messages)
  if (listing?.contact_phone) {
    const ownerMessage = `🔔 *New Callback Request*\n\n📋 *PG:* ${listing.name}\n👤 *Tenant:* ${safeName}\n📞 *Phone:* ${phone}\n⏰ *Preferred:* ${safeTimePreference || "Anytime"}\n\nPlease call them back soon!`;

    // Store the WhatsApp URL for the frontend to optionally open
    return NextResponse.json({
      success: true,
      ownerWhatsApp: `https://wa.me/91${listing.contact_phone}?text=${encodeURIComponent(ownerMessage)}`,
    });
  }

  return NextResponse.json({ success: true });
}
