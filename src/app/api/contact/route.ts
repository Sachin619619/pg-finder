import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { isValidEmail, sanitizeString, isNonEmptyString } from "@/lib/validate";

export async function POST(req: Request) {
  const limited = rateLimit(getClientIp(req), "contact", 5);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!isNonEmptyString(name) || name.length > 200) {
      return NextResponse.json({ error: "Valid name is required (max 200 chars)" }, { status: 400 });
    }
    if (!isNonEmptyString(email) || !isValidEmail(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }
    if (!isNonEmptyString(subject)) {
      return NextResponse.json({ error: "Subject is required" }, { status: 400 });
    }
    if (!isNonEmptyString(message) || message.length > 5000) {
      return NextResponse.json({ error: "Message is required (max 5000 chars)" }, { status: 400 });
    }

    const validSubjects = ["general", "listing", "account", "payment", "report", "partnership", "feedback"];
    if (!validSubjects.includes(subject)) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }

    const safeName = sanitizeString(name, 200);
    const safeMessage = sanitizeString(message, 5000);

    const { error } = await supabase
      .from("contact_messages")
      .insert({
        name: safeName,
        email,
        subject,
        message: safeMessage,
      });

    if (error) {
      // If table doesn't exist yet, still return success (log for admin)
      console.error("Contact form submission:", error.message);
      // Fallback: just log it
      console.log("Contact form:", { name: safeName, email, subject, message: safeMessage });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
