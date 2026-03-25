import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/cron/price-alerts - Check for price drops and send alerts
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all active price alerts
    const { data: alerts, error } = await supabase
      .from("price_alerts")
      .select("*")
      .eq("is_active", true);

    if (error) {
      console.error("Fetch alerts error:", error);
      return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const alert of alerts || []) {
      try {
        // Check notification frequency
        const { data: notifPrefs } = await supabase
          .from("notification_preferences")
          .select("price_alert_frequency, email_notifications")
          .eq("user_id", alert.user_id)
          .single();

        // Skip if notifications disabled
        if (notifPrefs && !notifPrefs.email_notifications) continue;

        // Check frequency limit
        if (notifPrefs?.price_alert_frequency === 'instant') {
          // Instant alerts
          await checkAndSendPriceAlert(alert);
          sentCount++;
        } else if (notifPrefs?.price_alert_frequency === 'daily') {
          // Daily digest - only send once per day
          const lastSent = alert.last_alert_sent_at;
          if (!lastSent || isOlderThan(lastSent, 24)) {
            await checkAndSendPriceAlert(alert);
            sentCount++;
          }
        } else if (notifPrefs?.price_alert_frequency === 'weekly') {
          // Weekly digest
          const lastSent = alert.last_alert_sent_at;
          if (!lastSent || isOlderThan(lastSent, 168)) { // 7 days
            await checkAndSendPriceAlert(alert);
            sentCount++;
          }
        } else {
          // Default: daily
          const lastSent = alert.last_alert_sent_at;
          if (!lastSent || isOlderThan(lastSent, 24)) {
            await checkAndSendPriceAlert(alert);
            sentCount++;
          }
        }
      } catch (err) {
        console.error(`Failed to process alert ${alert.id}:`, err);
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      processed: alerts?.length || 0,
      sent: sentCount,
      failed: failedCount,
    });
  } catch (error) {
    console.error("Price alerts cron error:", error);
    return NextResponse.json({ error: "Failed to process alerts" }, { status: 500 });
  }
}

async function checkAndSendPriceAlert(alert: Record<string, unknown>): Promise<void> {
  // Get listings in the area within budget
  const { data: listings } = await supabase
    .from("listings")
    .select("id, name, area, price, rating, images")
    .eq("status", "active")
    .eq("area", alert.area)
    .lte("price", alert.max_price)
    .order("price", { ascending: true })
    .limit(5);

  if (!listings || listings.length === 0) return;

  // Get user email
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", alert.user_id)
    .single();

  if (!profile?.email) return;

  // Send email
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  const html = `
    <h2>🎉 Price Alert: New PGs in ${alert.area}!</h2>
    <p>Great news! We found ${listings.length} PGs within your budget of ₹${(alert.max_price as number).toLocaleString()}.</p>
    ${listings.map((pg: Record<string, unknown>) => `
      <div style="border:1px solid #eee;padding:16px;margin:8px 0;border-radius:8px;">
        <h3 style="margin:0 0 8px;">${pg.name}</h3>
        <p style="margin:0;color:#666;">📍 ${pg.area}</p>
        <p style="margin:4px 0;"><strong>₹${(pg.price as number).toLocaleString()}/month</strong> · ⭐ ${pg.rating}</p>
      </div>
    `).join('')}
    <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://castleliving.in'}/search?area=${encodeURIComponent(alert.area as string)}">View All →</a></p>
  `;

  if (sendgridKey) {
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendgridKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: profile.email }] }],
        from: { email: "noreply@castlepg.com", name: "Castle" },
        subject: `🎉 Price Alert: PGs in ${alert.area} within budget!`,
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
        to: profile.email,
        subject: `🎉 Price Alert: PGs in ${alert.area} within budget!`,
        html,
      }),
    });
  } else {
    console.log(`[Email] Would send price alert to ${profile.email} for area ${alert.area}`);
  }

  // Update last alert sent time
  await supabase
    .from("price_alerts")
    .update({ last_alert_sent_at: new Date().toISOString() })
    .eq("id", alert.id);
}

function isOlderThan(timestamp: string, hours: number): boolean {
  const date = new Date(timestamp);
  const now = new Date();
  return now.getTime() - date.getTime() > hours * 60 * 60 * 1000;
}
