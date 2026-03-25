import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/webhooks/twilio - Twilio webhook verification
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.TWILIO_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken) {
    console.log("Twilio webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// POST /api/webhooks/twilio - Handle Twilio status callbacks
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const messageSid = formData.get("MessageSid");
    const messageStatus = formData.get("MessageStatus");
    const to = formData.get("To");
    const errorCode = formData.get("ErrorCode");
    const errorMessage = formData.get("ErrorMessage");

    console.log(`[Twilio] Message ${messageSid} to ${to}: ${messageStatus}`);

    if (errorCode) {
      console.error(`[Twilio] Error ${errorCode}: ${errorMessage}`);
    }

    // Update notification log with delivery status
    if (messageSid) {
      await supabase
        .from("notification_log")
        .update({
          status: mapTwilioStatus(messageStatus),
          error_message: errorMessage,
        })
        .eq("metadata->>twilio_sid", messageSid);
    }

    // Handle different statuses
    switch (messageStatus) {
      case "delivered":
        // Message was delivered
        break;

      case "sent":
        // Message was sent
        break;

      case "failed":
        // Log failure for investigation
        await logDeliveryFailure(messageSid, to, errorCode, errorMessage);
        break;

      case "undelivered":
        // Message could not be delivered
        await logDeliveryFailure(messageSid, to, errorCode, "Undelivered");
        break;

      case "queued":
      case "sending":
      case "sent":
        // In progress - no action needed
        break;
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[Twilio] Webhook error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}

function mapTwilioStatus(twilioStatus: string | null): "sent" | "delivered" | "failed" | "bounced" {
  switch (twilioStatus) {
    case "delivered":
      return "delivered";
    case "failed":
    case "undelivered":
      return "failed";
    case "sent":
      return "sent";
    default:
      return "sent";
  }
}

async function logDeliveryFailure(
  messageSid: string | null,
  to: string | null,
  errorCode: string | null,
  errorMessage: string | null
): Promise<void> {
  try {
    await supabase.from("notification_failures").insert({
      provider: "twilio",
      message_sid: messageSid,
      recipient: to,
      error_code: errorCode,
      error_message: errorMessage,
      failed_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to log delivery failure:", err);
  }
}
