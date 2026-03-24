// ─── Email Notification Utility ───
// Supports SendGrid, Resend, or console logging (dev mode)

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

// ─── Core send function ───

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<{ success: boolean; error?: string }> {
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const resendKey = process.env.RESEND_API_KEY;

  // SendGrid
  if (sendgridKey) {
    try {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendgridKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: "noreply@castlepg.com", name: "Castle" },
          subject,
          content: [{ type: "text/html", value: html }],
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("[Email] SendGrid error:", text);
        return { success: false, error: text };
      }
      return { success: true };
    } catch (err) {
      console.error("[Email] SendGrid request failed:", err);
      return { success: false, error: String(err) };
    }
  }

  // Resend
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Castle <noreply@castlepg.com>",
          to,
          subject,
          html,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("[Email] Resend error:", text);
        return { success: false, error: text };
      }
      return { success: true };
    } catch (err) {
      console.error("[Email] Resend request failed:", err);
      return { success: false, error: String(err) };
    }
  }

  // Dev mode — no provider configured, log to console
  console.log("[Email] (dev mode) Would send email:");
  console.log(`  To: ${to}`);
  console.log(`  Subject: ${subject}`);
  console.log(`  Body length: ${html.length} chars`);
  return { success: true };
}

// ─── HTML wrapper with Castle branding ───

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
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1B1C15,#1B1C15);padding:28px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:0.5px;">Castle</h1>
              <p style="margin:4px 0 0;color:#e9d5ff;font-size:13px;">Find your perfect PG</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#faf5ff;border-top:1px solid #ede9fe;text-align:center;">
              <p style="margin:0 0 6px;font-size:12px;color:#1B1C15;">
                <a href="https://castleliving.in" style="color:#1B1C15;text-decoration:none;">Visit Castle</a>
                &nbsp;&middot;&nbsp;
                <a href="https://castleliving.in/listings" style="color:#1B1C15;text-decoration:none;">Browse PGs</a>
                &nbsp;&middot;&nbsp;
                <a href="https://castleliving.in/help" style="color:#1B1C15;text-decoration:none;">Help</a>
              </p>
              <p style="margin:0;font-size:11px;color:#a1a1aa;">You received this because you have an account on Castle.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Template functions ───

export function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: "Welcome to Castle!",
    html: wrapInTemplate(`
      <h2 style="margin:0 0 16px;color:#1e1b4b;font-size:20px;">Welcome, ${name}!</h2>
      <p style="margin:0 0 12px;color:#4b5563;font-size:15px;line-height:1.6;">
        We're excited to have you on Castle. Whether you're looking for the perfect PG or listing your property, we've got you covered.
      </p>
      <p style="margin:0 0 24px;color:#4b5563;font-size:15px;line-height:1.6;">
        Here's what you can do next:
      </p>
      <ul style="margin:0 0 24px;padding-left:20px;color:#4b5563;font-size:14px;line-height:1.8;">
        <li>Browse PG listings near you</li>
        <li>Save your favourites</li>
        <li>Request callbacks from owners</li>
        <li>Compare prices and amenities</li>
      </ul>
      <a href="https://castleliving.in/listings" style="display:inline-block;background:#1B1C15;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
        Explore PGs
      </a>
    `),
  });
}

export function sendBookingConfirmation(to: string, name: string, pgName: string, date: string, amount: number) {
  return sendEmail({
    to,
    subject: `Booking Confirmed — ${pgName}`,
    html: wrapInTemplate(`
      <h2 style="margin:0 0 16px;color:#1e1b4b;font-size:20px;">Booking Confirmed!</h2>
      <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
        Hi ${name}, your booking has been confirmed. Here are the details:
      </p>
      <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;">PG Name</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#1e1b4b;font-size:14px;font-weight:600;text-align:right;">${pgName}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;">Move-in Date</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f3f4f6;color:#1e1b4b;font-size:14px;font-weight:600;text-align:right;">${date}</td>
        </tr>
        <tr>
          <td style="padding:10px 12px;color:#6b7280;font-size:13px;">Amount</td>
          <td style="padding:10px 12px;color:#1B1C15;font-size:16px;font-weight:700;text-align:right;">&#8377;${amount.toLocaleString("en-IN")}</td>
        </tr>
      </table>
      <p style="margin:0;color:#6b7280;font-size:13px;line-height:1.6;">
        The PG owner will reach out to you soon with move-in instructions. If you have questions, reply to this email or contact us through the app.
      </p>
    `),
  });
}

export function sendCallbackNotification(
  to: string,
  ownerName: string,
  tenantName: string,
  tenantPhone: string,
  pgName: string
) {
  return sendEmail({
    to,
    subject: `New Callback Request — ${pgName}`,
    html: wrapInTemplate(`
      <h2 style="margin:0 0 16px;color:#1e1b4b;font-size:20px;">New Callback Request</h2>
      <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
        Hi ${ownerName}, someone is interested in your PG listing <strong>${pgName}</strong> and has requested a callback.
      </p>
      <div style="background:#faf5ff;border:1px solid #ede9fe;border-radius:8px;padding:16px;margin:0 0 24px;">
        <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Tenant Details</p>
        <p style="margin:0 0 4px;color:#1e1b4b;font-size:15px;font-weight:600;">${tenantName}</p>
        <p style="margin:0;color:#1B1C15;font-size:15px;font-weight:600;">${tenantPhone}</p>
      </div>
      <p style="margin:0 0 20px;color:#4b5563;font-size:14px;line-height:1.6;">
        Please call them back at the earliest to secure the booking.
      </p>
      <a href="tel:${tenantPhone}" style="display:inline-block;background:#1B1C15;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
        Call Now
      </a>
    `),
  });
}

export function sendListingApproved(to: string, ownerName: string, pgName: string) {
  return sendEmail({
    to,
    subject: `Your listing "${pgName}" is now live!`,
    html: wrapInTemplate(`
      <h2 style="margin:0 0 16px;color:#1e1b4b;font-size:20px;">Your Listing is Live!</h2>
      <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
        Hi ${ownerName}, great news! Your PG listing <strong>${pgName}</strong> has been reviewed and approved. It's now visible to tenants on Castle.
      </p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:0 0 24px;text-align:center;">
        <p style="margin:0;color:#16a34a;font-size:16px;font-weight:600;">Approved</p>
      </div>
      <p style="margin:0 0 20px;color:#4b5563;font-size:14px;line-height:1.6;">
        Tenants can now find, view, and request callbacks for your property. Make sure your contact details are up to date.
      </p>
      <a href="https://castleliving.in/listings" style="display:inline-block;background:#1B1C15;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
        View Your Listing
      </a>
    `),
  });
}

export function sendListingRejected(to: string, ownerName: string, pgName: string, reason?: string) {
  return sendEmail({
    to,
    subject: `Update on your listing "${pgName}"`,
    html: wrapInTemplate(`
      <h2 style="margin:0 0 16px;color:#1e1b4b;font-size:20px;">Listing Not Approved</h2>
      <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.6;">
        Hi ${ownerName}, after review, your PG listing <strong>${pgName}</strong> was not approved at this time.
      </p>
      ${reason ? `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin:0 0 24px;">
        <p style="margin:0 0 4px;color:#6b7280;font-size:13px;">Reason</p>
        <p style="margin:0;color:#dc2626;font-size:14px;">${reason}</p>
      </div>
      ` : ""}
      <p style="margin:0 0 20px;color:#4b5563;font-size:14px;line-height:1.6;">
        You can update your listing details and resubmit for review. If you think this was a mistake, please reach out to our support team.
      </p>
      <a href="https://castleliving.in/dashboard" style="display:inline-block;background:#1B1C15;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
        Edit Listing
      </a>
    `),
  });
}
