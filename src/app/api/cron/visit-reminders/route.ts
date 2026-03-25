import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/cron/visit-reminders - Send visit reminders (callable by cron service)
export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfterTomorrow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    // Find visits scheduled for tomorrow and day after tomorrow
    const { data: upcomingVisits, error } = await supabase
      .from("scheduled_visits")
      .select("*")
      .eq("status", "scheduled")
      .gte("visit_date", tomorrow.toISOString().split("T")[0])
      .lt("visit_date", dayAfterTomorrow.toISOString().split("T")[0])
      .eq("reminder_sent", false);

    if (error) {
      console.error("Fetch visits error:", error);
      return NextResponse.json({ error: "Failed to fetch visits" }, { status: 500 });
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const visit of upcomingVisits || []) {
      try {
        // Get user notification preferences
        const { data: notifPrefs } = await supabase
          .from("notification_preferences")
          .select("*")
          .eq("user_id", visit.user_id)
          .single();

        // Skip if reminders disabled
        if (notifPrefs && !notifPrefs.visit_reminders) continue;

        // Get PG details
        const { data: pg } = await supabase
          .from("listings")
          .select("name")
          .eq("id", visit.pg_id)
          .single();

        const pgName = pg?.name || "the PG";

        // Send email
        if (notifPrefs?.email_notifications) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("email")
            .eq("id", visit.user_id)
            .single();

          if (profile?.email) {
            await sendEmailReminder(profile.email, visit, pgName);
          }
        }

        // Send SMS
        if (notifPrefs?.sms_notifications) {
          await sendSMSReminder(visit.visitor_phone, visit, pgName);
        }

        // Send WhatsApp
        if (notifPrefs?.whatsapp_notifications) {
          const { data: waSession } = await supabase
            .from("whatsapp_sessions")
            .select("phone")
            .eq("user_id", visit.user_id)
            .eq("is_verified", true)
            .single();

          if (waSession?.phone) {
            await sendWhatsAppReminder(waSession.phone, visit, pgName);
          }
        }

        // Mark reminder as sent
        await supabase
          .from("scheduled_visits")
          .update({ reminder_sent: true })
          .eq("id", visit.id);

        sentCount++;
      } catch (err) {
        console.error(`Failed to send reminder for visit ${visit.id}:`, err);
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: upcomingVisits?.length || 0,
      sent: sentCount,
      failed: failedCount,
    });
  } catch (error) {
    console.error("Visit reminders cron error:", error);
    return NextResponse.json({ error: "Failed to process reminders" }, { status: 500 });
  }
}

async function sendEmailReminder(email: string, visit: Record<string, unknown>, pgName: string): Promise<void> {
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  const html = `
    <h2>Visit Reminder ⏰</h2>
    <p>This is a reminder about your scheduled visit:</p>
    <p><strong>Property:</strong> ${pgName}</p>
    <p><strong>Date:</strong> ${visit.visit_date}</p>
    <p><strong>Time:</strong> ${visit.visit_time}</p>
    <p>Please carry a valid ID proof.</p>
    <p>We look forward to seeing you!</p>
  `;

  if (sendgridKey) {
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendgridKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: "noreply@castlepg.com", name: "Castle" },
        subject: `Visit Reminder - ${pgName}`,
        content: [{ type: "text/html", value: html }],
      }),
    });
  } else if (resendKey) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Castle <noreply@castlepg.com>",
        to: email,
        subject: `Visit Reminder - ${pgName}`,
        html,
      }),
    });
  } else {
    console.log(`[Email] Would send visit reminder to ${email}`);
  }
}

async function sendSMSReminder(phone: string, visit: Record<string, unknown>, pgName: string): Promise<void> {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  const message = `Castle: Reminder - Visit to ${pgName} on ${visit.visit_date} at ${visit.visit_time}. Please carry a valid ID.`;

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
          Body: message,
        }),
      }
    );
  } else {
    console.log(`[SMS] Would send visit reminder to ${phone}`);
  }
}

async function sendWhatsAppReminder(phone: string, visit: Record<string, unknown>, pgName: string): Promise<void> {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;

  const message = `⏰ *Visit Reminder*\n\nYour visit to *${pgName}* is scheduled for:\n\n📅 ${visit.visit_date}\n🕐 ${visit.visit_time}\n\nPlease carry a valid ID. See you there!`;

  if (twilioSid && twilioToken && whatsappFrom) {
    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: `whatsapp:+91${phone}`,
          From: `whatsapp:${whatsappFrom}`,
          Body: message,
        }),
      }
    );
  } else {
    console.log(`[WhatsApp] Would send visit reminder to ${phone}`);
  }
}
