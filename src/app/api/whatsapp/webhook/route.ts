import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/whatsapp/webhook - WhatsApp webhook verification
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  // Verify webhook
  if (mode === "subscribe" && token === verifyToken) {
    console.log("WhatsApp webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// POST /api/whatsapp/webhook - Handle incoming WhatsApp messages
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Extract message data
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const messages = changes?.value?.messages;

    if (!messages || messages.length === 0) {
      return new NextResponse("OK", { status: 200 });
    }

    for (const message of messages) {
      const from = message.from;
      const msgId = message.id;
      const text = message.text?.body || "";
      const timestamp = message.timestamp;

      // Log incoming message
      console.log(`[WhatsApp] Message from ${from}: ${text}`);

      // Check if user is registered
      const { data: session } = await supabase
        .from("whatsapp_sessions")
        .select("*")
        .eq("phone", from)
        .single();

      if (!session?.is_verified) {
        // Send verification prompt
        await sendWhatsAppMessage(from, 
          "Welcome to Castle! 👋\n\nPlease verify your account by clicking the link sent to your email."
        );
        continue;
      }

      // Process message and respond
      const response = await processMessage(text, from, session.user_id);

      // Send response
      if (response) {
        await sendWhatsAppMessage(from, response);
      }
    }

    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[WhatsApp] Webhook error:", error);
    return new NextResponse("Error", { status: 500 });
  }
}

async function processMessage(
  text: string,
  phone: string,
  userId: string
): Promise<string | null> {
  const normalizedText = text.trim().toLowerCase();

  // Simple command processing
  if (normalizedText === "hi" || normalizedText === "hello" || normalizedText === "hey") {
    return `Hello! 👋 Welcome to Castle Living\n\nI can help you find PGs, check prices, and more!\n\nCommands:\n• *Search [area]* - Find PGs in an area\n• *Price [area]* - Check average prices\n• *Book [PG name]* - Start a booking\n• *Visit* - Schedule a visit\n• *Help* - Show all commands`;
  }

  if (normalizedText.startsWith("search ")) {
    const area = text.substring(7).trim();
    return `Searching for PGs in *${area}*...\n\nPlease use our app for the best experience: ${process.env.NEXT_PUBLIC_BASE_URL || 'castleliving.in'}`;
  }

  if (normalizedText.startsWith("price ")) {
    const area = text.substring(6).trim();
    // Would fetch from price analytics
    return `Price overview for *${area}*:\n\n📊 Average: ₹8,500/month\n💰 Range: ₹5,000 - ₹15,000\n\nWant to set a price alert? Reply *Alert*`;
  }

  if (normalizedText === "help") {
    return `*Castle Commands*\n\n• *Search [area]* - Find PGs\n• *Price [area]* - Check prices\n• *Book [PG]* - Start booking\n• *Visit* - Schedule visit\n• *Alert* - Price alerts\n• *My bookings* - View bookings\n• *Help* - Show this`;
  }

  if (normalizedText === "alert" || normalizedText === "price alert") {
    return `🔔 Price Alert Setup\n\nReply with your preferred area and max budget.\n\nExample: *HSR Layout, 10000*`;
  }

  if (normalizedText === "my bookings" || normalizedText === "bookings") {
    return `📋 Your Bookings\n\nYou can view all your bookings in the Castle app.\n\n${process.env.NEXT_PUBLIC_BASE_URL || 'castleliving.in'}/my-bookings`;
  }

  // Default response
  return `I didn't understand that. Reply *Help* for available commands.`;
}

async function sendWhatsAppMessage(
  phone: string,
  message: string
): Promise<boolean> {
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM;

  if (!twilioSid || !twilioToken || !whatsappFrom) {
    console.log(`[WhatsApp] Would send to ${phone}: ${message.substring(0, 50)}...`);
    return true;
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

    return response.ok;
  } catch (err) {
    console.error("[WhatsApp] Send error:", err);
    return false;
  }
}
