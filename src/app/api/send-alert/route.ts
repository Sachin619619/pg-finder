import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isNonEmptyString, sanitizeString } from "@/lib/validate";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// POST /api/send-alert — Sends price alert emails to subscribers
// In production, integrate with Resend/SendGrid by adding RESEND_API_KEY
export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), "send-alert", 15);
  if (limited) return limited;

  const { area, listings } = await req.json();

  // ── Validation ──
  if (!isNonEmptyString(area)) {
    return NextResponse.json({ error: "area is required and must be a non-empty string" }, { status: 400 });
  }
  if (listings !== undefined && !Array.isArray(listings)) {
    return NextResponse.json({ error: "listings must be an array" }, { status: 400 });
  }
  if (listings && listings.length > 0) {
    for (let i = 0; i < listings.length; i++) {
      const l = listings[i];
      if (typeof l.price !== "number" || l.price < 0) {
        return NextResponse.json({ error: `listings[${i}].price must be a positive number` }, { status: 400 });
      }
    }
  }

  const sanitizedArea = sanitizeString(area, 100);

  // Fetch subscribers for this area
  const { data: subscribers } = await supabase
    .from("price_alerts")
    .select("*")
    .or(`area.eq.${sanitizedArea},area.is.null`);

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({ sent: 0, message: "No subscribers for this area" });
  }

  // Filter subscribers by max price
  const matchedListings = listings || [];
  const eligibleSubs = subscribers.filter((sub: { max_price: number }) =>
    matchedListings.some((l: { price: number }) => l.price <= sub.max_price)
  );

  // If RESEND_API_KEY is set, send real emails
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    for (const sub of eligibleSubs) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "Castle <alerts@castle.in>",
          to: sub.email,
          subject: `🏠 New PGs in ${area} within your budget!`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #1B1C15;">New PGs in ${area}!</h2>
              <p>Hi! We found PGs matching your criteria (under ₹${sub.max_price?.toLocaleString()}/month):</p>
              ${matchedListings
                .filter((l: { price: number }) => l.price <= sub.max_price)
                .map((l: { name: string; price: number; id: string }) => `
                  <div style="padding: 12px; border: 1px solid #e5e7eb; border-radius: 12px; margin: 8px 0;">
                    <strong>${l.name}</strong> — ₹${l.price.toLocaleString()}/month
                    <br><a href="https://castleliving.in/listing/${l.id}" style="color: #1B1C15;">View Details →</a>
                  </div>
                `).join("")}
              <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
                You received this because you subscribed to price alerts on Castle.
              </p>
            </div>
          `,
        }),
      });
    }
  }

  return NextResponse.json({
    sent: eligibleSubs.length,
    message: resendKey ? "Emails sent successfully" : "Email service not configured — add RESEND_API_KEY to .env",
    subscribers: eligibleSubs.length,
  });
}
