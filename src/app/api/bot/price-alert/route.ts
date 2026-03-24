import { NextResponse } from "next/server";
import { validateBotRequest } from "@/lib/bot-auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  if (!validateBotRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { userEmail, area, maxPrice } = body;

    if (!userEmail || !area || !maxPrice) {
      return NextResponse.json(
        { error: "userEmail, area, and maxPrice are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("price_alerts").insert({
      email: userEmail,
      area,
      max_price: maxPrice,
    });

    if (error) {
      console.error("Price alert insert error:", error);
      return NextResponse.json(
        { success: false, message: "Failed to create price alert. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Price alert set! You'll be notified when PGs under ₹${maxPrice.toLocaleString("en-IN")} appear in ${area}.`,
    });
  } catch (error) {
    console.error("Bot price-alert error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
