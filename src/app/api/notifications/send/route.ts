import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/notifications/send - Send notification via email, SMS, or WhatsApp
export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "notifications", 20);
  if (limited) return limited;

  try {
    const body = await req.json();
    const {
      userId,
      type,
      channel, // 'email', 'sms', 'whatsapp'
      recipient,
      subject,
      content,
      metadata = {},
    } = body;

    if (!type || !channel || !recipient) {
      return NextResponse.json(
        { error: "type, channel, and recipient are required" },
        { status: 400 }
      );
    }

    let status: "sent" | "delivered" | "failed" = "sent";
    let errorMessage: string | null = null;

    try {
      if (channel === "email") {
        const result = await sendEmail({
          to: recipient,
          subject: subject || getDefaultSubject(type),
          html: wrapInTemplate(content || getDefaultContent(type, metadata)),
        });

        if (!result.success) {
          status = "failed";
          errorMessage = result.error || "Email send failed";
        }
      } else if (channel === "sms") {
        const result = await sendSMS(recipient, content || getDefaultSMS(type, metadata));
        if (!result.success) {
          status = "failed";
          errorMessage = result.error;
        }
      } else if (channel === "whatsapp") {
        const result = await sendWhatsApp(recipient, content || getDefaultWhatsApp(type, metadata));
        if (!result.success) {
          status = "failed";
          errorMessage = result.error;
        }
      }
    } catch (err) {
      status = "failed";
      errorMessage = String(err);
    }

    // Log notification
    await supabase
      .from("notification_log")
      .insert({
        user_id: userId || null,
        notification_type: type,
        channel,
        recipient,
        subject: subject || null,
        content: content || null,
        status,
        error_message: errorMessage,
        metadata,
      });

    return NextResponse.json({
      success: status === "sent" || status === "delivered",
      status,
      error: errorMessage,
    });
  } catch (error) {
    console.error("Send notification error:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}

// GET /api/notifications/send - Get user's notification history
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 401 });
  }

  try {
    const { data: notifications, error } = await supabase
      .from("notification_log")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Get notifications error:", error);
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }

    return NextResponse.json({ notifications: notifications || [], count: notifications?.length || 0 });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// ─── SMS Sending (Twilio integration ready) ───
async function sendSMS(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (!twilioSid || !twilioToken || !twilioFrom) {
    console.log(`[SMS] (dev mode) Would send to ${phone}: ${message.substring(0, 50)}...`);
    return { success: true };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: phone.startsWith("+") ? phone : `+91${phone}`,
          From: twilioFrom,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("[SMS] Twilio error:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error("[SMS] Request failed:", err);
    return { success: false, error: String(err) };
  }
}

// ─── WhatsApp Sending (Twilio WhatsApp or custom webhook) ───
async function sendWhatsApp(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;

  if (!twilioSid || !twilioToken || !whatsappFrom) {
    console.log(`[WhatsApp] (dev mode) Would send to ${phone}: ${message.substring(0, 50)}...`);
    return { success: true };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: `whatsapp:${phone.startsWith("+") ? phone : `+91${phone}`}`,
          From: `whatsapp:${whatsappFrom}`,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("[WhatsApp] Twilio error:", error);
      return { success: false, error };
    }

    return { success: true };
  } catch (err) {
    console.error("[WhatsApp] Request failed:", err);
    return { success: false, error: String(err) };
  }
}

// ─── Default Templates ───
function getDefaultSubject(type: string): string {
  const subjects: Record<string, string> = {
    booking_confirmation: "Booking Confirmed - Castle",
    visit_reminder: "Visit Reminder - Castle",
    price_alert: "Price Alert - Castle",
    marketing: "Special Offer - Castle",
  };
  return subjects[type] || "Message from Castle";
}

function getDefaultContent(type: string, metadata: Record<string, unknown>): string {
  if (type === "booking_confirmation") {
    return `
      <h2>Booking Confirmed! 🎉</h2>
      <p>Your booking at <strong>${metadata.pgName || 'the PG'}</strong> has been confirmed.</p>
      <p><strong>Check-in:</strong> ${metadata.moveInDate || 'As discussed'}</p>
      <p><strong>Room Type:</strong> ${metadata.roomType || 'Standard'}</p>
      <p>We will contact you shortly with more details.</p>
    `;
  }

  if (type === "visit_reminder") {
    return `
      <h2>Visit Reminder ⏰</h2>
      <p>This is a reminder about your scheduled visit to <strong>${metadata.pgName || 'the PG'}</strong>.</p>
      <p><strong>Date:</strong> ${metadata.visitDate}</p>
      <p><strong>Time:</strong> ${metadata.visitTime}</p>
      <p>Please carry a valid ID proof. We look forward to seeing you!</p>
    `;
  }

  if (type === "price_alert") {
    return `
      <h2>Price Alert! 💰</h2>
      <p>Good news! There's a new listing in <strong>${metadata.area || 'your preferred area'}</strong> within your budget.</p>
      <p><strong>Name:</strong> ${metadata.pgName}</p>
      <p><strong>Price:</strong> ₹${metadata.price?.toLocaleString()}</p>
      <p><a href="${metadata.link}">View Listing →</a></p>
    `;
  }

  return `<p>${metadata.message || 'You have a new message from Castle.'}</p>`;
}

function getDefaultSMS(type: string, metadata: Record<string, unknown>): string {
  if (type === "booking_confirmation") {
    return `Castle: Booking confirmed at ${metadata.pgName}. Move-in: ${metadata.moveInDate}. Details sent to email.`;
  }
  if (type === "visit_reminder") {
    return `Castle: Reminder - Visit to ${metadata.pgName} on ${metadata.visitDate} at ${metadata.visitTime}.`;
  }
  if (type === "price_alert") {
    return `Castle: New PG in ${metadata.area} within your budget! ₹${metadata.price?.toLocaleString()}. View: ${metadata.link}`;
  }
  return "Castle: You have a new notification. Check your email for details.";
}

function getDefaultWhatsApp(type: string, metadata: Record<string, unknown>): string {
  if (type === "booking_confirmation") {
    return `🏠 *Booking Confirmed!*\n\nYour booking at *${metadata.pgName}* is confirmed!\n\n📅 Check-in: ${metadata.moveInDate}\n🛏️ Room: ${metadata.roomType}\n\nWe'll contact you soon with more details.`;
  }
  if (type === "visit_reminder") {
    return `⏰ *Visit Reminder*\n\nYour visit to *${metadata.pgName}* is scheduled for:\n\n📅 ${metadata.visitDate}\n🕐 ${metadata.visitTime}\n\nPlease carry a valid ID. See you there!`;
  }
  if (type === "price_alert") {
    return `💰 *Price Alert!*\n\nNew listing in *${metadata.area}* within your budget!\n\n🏠 ${metadata.pgName}\n💵 ₹${metadata.price?.toLocaleString()}/month\n\nTap to view: ${metadata.link}`;
  }
  return `Castle: You have a new notification. Check your email for details.`;
}

function wrapInTemplate(body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Castle</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#1B1C15,#1B1C15);padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:0.5px;">Castle</h1>
              <p style="margin:4px 0 0;color:#e9d5ff;font-size:13px;">Find your perfect PG</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px;background:#f8f8fa;text-align:center;">
              <p style="margin:0;color:#888;font-size:12px;">
                Castle Living · Your PG Search Partner<br>
                <a href="#" style="color:#666;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
