import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { pgId, name, phone, timePreference } = await req.json();

  if (!pgId || !name || !phone) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // 1. Save callback to DB
  const { error } = await supabase
    .from("callbacks")
    .insert({ pg_id: pgId, name, phone, time_preference: timePreference });

  if (error) {
    return NextResponse.json({ error: "Failed to save callback" }, { status: 500 });
  }

  // 2. Get PG details for owner notification
  const { data: listing } = await supabase
    .from("listings")
    .select("name, contact_phone, contact_name")
    .eq("id", pgId)
    .single();

  // 3. Send WhatsApp notification to PG owner via wa.me redirect URL
  // (In production, use WhatsApp Business API or Twilio for automated messages)
  if (listing?.contact_phone) {
    const ownerMessage = `🔔 *New Callback Request*\n\n📋 *PG:* ${listing.name}\n👤 *Tenant:* ${name}\n📞 *Phone:* ${phone}\n⏰ *Preferred:* ${timePreference || "Anytime"}\n\nPlease call them back soon!`;

    // Store the WhatsApp URL for the frontend to optionally open
    return NextResponse.json({
      success: true,
      ownerWhatsApp: `https://wa.me/91${listing.contact_phone}?text=${encodeURIComponent(ownerMessage)}`,
    });
  }

  return NextResponse.json({ success: true });
}
