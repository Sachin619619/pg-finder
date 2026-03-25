// Notification Service - Centralized notification management
// Supports email, SMS, WhatsApp

import { supabase } from "./supabase";

export type NotificationType =
  | "booking_confirmation"
  | "visit_reminder"
  | "price_alert"
  | "whatsapp_message"
  | "sms_message"
  | "email"
  | "marketing";

export type NotificationChannel = "email" | "sms" | "whatsapp" | "push";

export type NotificationPayload = {
  userId?: string;
  type: NotificationType;
  channel: NotificationChannel;
  recipient: string;
  subject?: string;
  content: string;
  metadata?: Record<string, unknown>;
};

// ─── Send Notification ───
export async function sendNotification(
  payload: NotificationPayload
): Promise<{ success: boolean; error?: string }> {
  const { userId, type, channel, recipient, subject, content, metadata } = payload;

  try {
    // Log the notification
    const { error: logError } = await supabase
      .from("notification_log")
      .insert({
        user_id: userId || null,
        notification_type: type,
        channel,
        recipient,
        subject: subject || null,
        content,
        status: "sent",
        metadata: metadata || {},
      });

    if (logError) {
      console.error("Failed to log notification:", logError);
    }

    // Send based on channel
    switch (channel) {
      case "email":
        return await sendEmailNotification(recipient, subject || "", content);
      case "sms":
        return await sendSMSNotification(recipient, content);
      case "whatsapp":
        return await sendWhatsAppNotification(recipient, content);
      default:
        return { success: false, error: "Unsupported channel" };
    }
  } catch (error) {
    console.error("Notification error:", error);
    return { success: false, error: String(error) };
  }
}

// ─── Email Notification ───
async function sendEmailNotification(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  if (sendgridKey) {
    try {
      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendgridKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: "noreply@castlepg.com", name: "Castle" },
          subject,
          content: [{ type: "text/html", value: wrapInTemplate(html) }],
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  if (resendKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Castle <noreply@castlepg.com>",
          to,
          subject,
          html: wrapInTemplate(html),
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { success: false, error };
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }

  // Dev mode
  console.log(`[Email] (dev) to: ${to}, subject: ${subject}`);
  return { success: true };
}

// ─── SMS Notification ───
async function sendSMSNotification(
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (!twilioSid || !twilioToken || !twilioFrom) {
    console.log(`[SMS] (dev) to: ${phone}, message: ${message.substring(0, 50)}...`);
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
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ─── WhatsApp Notification ───
async function sendWhatsAppNotification(
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;

  if (!twilioSid || !twilioToken || !whatsappFrom) {
    console.log(`[WhatsApp] (dev) to: ${phone}, message: ${message.substring(0, 50)}...`);
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
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ─── HTML Template ───
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

// ─── Get User's Notification History ───
export async function getNotificationHistory(
  userId: string,
  limit: number = 20
): Promise<Array<{
  id: string;
  type: string;
  channel: string;
  status: string;
  created_at: string;
}>> {
  const { data, error } = await supabase
    .from("notification_log")
    .select("id, notification_type, channel, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Get notification history error:", error);
    return [];
  }

  return data || [];
}

// ─── Check User Notification Preferences ───
export async function getUserNotificationPreferences(userId: string): Promise<{
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  push: boolean;
  marketing: boolean;
} | null> {
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Get notification prefs error:", error);
    return null;
  }

  if (!data) return null;

  return {
    email: data.email_notifications,
    sms: data.sms_notifications,
    whatsapp: data.whatsapp_notifications,
    push: data.push_notifications,
    marketing: data.marketing_emails,
  };
}

// ─── Send Bulk Notifications ───
export async function sendBulkNotifications(
  notifications: NotificationPayload[]
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const notification of notifications) {
    const result = await sendNotification(notification);
    if (result.success) sent++;
    else failed++;
  }

  return { sent, failed };
}
