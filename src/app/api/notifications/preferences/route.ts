import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/notifications/preferences - Get notification preferences
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
    }

    // Return defaults if no preferences set
    return NextResponse.json({
      preferences: data || {
        email_notifications: true,
        sms_notifications: true,
        whatsapp_notifications: false,
        push_notifications: true,
        marketing_emails: false,
        visit_reminders: true,
        price_alert_frequency: "daily",
        preferred_contact_time: "any",
      }
    });
  } catch (error) {
    console.error("Get notification prefs error:", error);
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 });
  }
}

// PUT /api/notifications/preferences - Update notification preferences
export async function PUT(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "notifications", 10);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { userId, ...prefs } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const {
      email_notifications,
      sms_notifications,
      whatsapp_notifications,
      push_notifications,
      marketing_emails,
      visit_reminders,
      price_alert_frequency,
      preferred_contact_time,
    } = prefs;

    const { error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: userId,
        email_notifications: email_notifications ?? true,
        sms_notifications: sms_notifications ?? true,
        whatsapp_notifications: whatsapp_notifications ?? false,
        push_notifications: push_notifications ?? true,
        marketing_emails: marketing_emails ?? false,
        visit_reminders: visit_reminders ?? true,
        price_alert_frequency: price_alert_frequency ?? "daily",
        preferred_contact_time: preferred_contact_time ?? "any",
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error("Update notification prefs error:", error);
      return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Preferences updated" });
  } catch (error) {
    console.error("Update notification prefs error:", error);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}

// POST /api/notifications/preferences - Subscribe to specific notifications
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, action, type, ...data } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    if (action === "subscribe_price_alert") {
      // Subscribe to price alerts for an area
      const { area, maxPrice, email } = data;

      const { error } = await supabase
        .from("price_alerts")
        .insert({
          user_id: userId,
          email: email || null,
          area: area,
          max_price: maxPrice || 999999,
        });

      if (error) {
        console.error("Price alert subscription error:", error);
        return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: `Subscribed to price alerts for ${area}` });
    }

    if (action === "unsubscribe_price_alert") {
      const { alertId } = data;

      await supabase
        .from("price_alerts")
        .delete()
        .eq("id", alertId)
        .eq("user_id", userId);

      return NextResponse.json({ success: true, message: "Unsubscribed from price alerts" });
    }

    if (action === "enable_whatsapp") {
      const { phone } = data;

      // Generate verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

      await supabase
        .from("whatsapp_sessions")
        .upsert({
          user_id: userId,
          phone,
          verification_code: code,
          verification_expires_at: expiresAt,
          is_verified: false,
        }, {
          onConflict: 'user_id'
        });

      // Send verification SMS
      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

      if (twilioSid && twilioToken && twilioFrom) {
        await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64")}`,
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              To: `+91${phone}`,
              From: twilioFrom,
              Body: `Castle Living: Your WhatsApp verification code is ${code}`,
            }),
          }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Verification code sent",
        expiresIn: 600, // 10 minutes
      });
    }

    if (action === "verify_whatsapp") {
      const { phone, code } = data;

      const { data: session } = await supabase
        .from("whatsapp_sessions")
        .select("*")
        .eq("user_id", userId)
        .eq("phone", phone)
        .single();

      if (!session || session.verification_code !== code) {
        return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
      }

      if (new Date(session.verification_expires_at) < new Date()) {
        return NextResponse.json({ error: "Verification code expired" }, { status: 400 });
      }

      await supabase
        .from("whatsapp_sessions")
        .update({
          is_verified: true,
          verification_code: null,
        })
        .eq("user_id", userId);

      // Enable WhatsApp notifications
      await supabase
        .from("notification_preferences")
        .upsert({
          user_id: userId,
          whatsapp_notifications: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      return NextResponse.json({ success: true, message: "WhatsApp verified successfully" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Notification action error:", error);
    return NextResponse.json({ error: "Failed to process" }, { status: 500 });
  }
}
