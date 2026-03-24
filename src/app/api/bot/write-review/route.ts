import { NextResponse } from "next/server";
import { validateBotRequest } from "@/lib/bot-auth";
import { supabaseAdmin } from "@/lib/server-auth";
import { fetchListings } from "@/lib/db";
import type { PGListing } from "@/data/listings";

function findPGByName(allListings: PGListing[], name: string): PGListing | undefined {
  if (!name) return undefined;
  const lower = name.toLowerCase().trim();
  return allListings.find(
    (pg) =>
      pg.name.toLowerCase().includes(lower) ||
      lower.includes(pg.name.toLowerCase().split(" ")[0])
  );
}

export async function POST(req: Request) {
  if (!validateBotRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userEmail, userName, pgName, rating, comment } = await req.json();

    if (!userEmail || !pgName || !rating) {
      return NextResponse.json({
        error: "userEmail, pgName, and rating are required",
      }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    const allListings = await fetchListings();
    const pg = findPGByName(allListings, pgName);

    if (!pg) {
      return NextResponse.json({
        success: false,
        message: `Couldn't find a PG matching "${pgName}".`,
      }, { status: 404 });
    }

    // Find user profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", userEmail)
      .single();

    // Check for existing review
    if (profile) {
      const { data: existing } = await supabaseAdmin
        .from("reviews")
        .select("id")
        .eq("pg_id", pg.id)
        .eq("user_id", profile.id)
        .single();

      if (existing) {
        // Update existing review
        await supabaseAdmin
          .from("reviews")
          .update({ rating, comment: comment || "", date: new Date().toISOString().split("T")[0] })
          .eq("id", existing.id);

        return NextResponse.json({
          success: true,
          message: `Your review for ${pg.name} has been updated! Rating: ${"⭐".repeat(rating)}`,
        });
      }
    }

    const { error } = await supabaseAdmin.from("reviews").insert({
      pg_id: pg.id,
      user_id: profile?.id || null,
      name: userName || userEmail.split("@")[0],
      rating,
      comment: comment || "",
      date: new Date().toISOString().split("T")[0],
      verified: !!profile,
      is_resident: false,
    });

    if (error) {
      console.error("Review insert error:", error);
      return NextResponse.json({
        success: false,
        message: "Failed to submit review. Please try again.",
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Review submitted for ${pg.name}! Rating: ${"⭐".repeat(rating)}${comment ? " — " + comment : ""}`,
    });
  } catch (error) {
    console.error("Bot write-review error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
