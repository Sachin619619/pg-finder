import { NextResponse } from "next/server";
import { validateBotRequest } from "@/lib/bot-auth";
import { supabaseAdmin } from "@/lib/server-auth";

export async function POST(req: Request) {
  if (!validateBotRequest(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userEmail, name, phone, username } = await req.json();

    if (!userEmail) {
      return NextResponse.json({ error: "userEmail is required" }, { status: 400 });
    }

    // Find user by email
    const { data: profile, error: findErr } = await supabaseAdmin
      .from("profiles")
      .select("id, name, phone, username, email")
      .eq("email", userEmail)
      .single();

    if (findErr || !profile) {
      return NextResponse.json({
        success: false,
        message: `No account found for ${userEmail}. The user needs to sign up on Castle Living first.`,
      }, { status: 404 });
    }

    // Build update object with only provided fields
    const updates: Record<string, string> = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (username) {
      // Validate username format
      if (!/^[a-z0-9_]{3,20}$/.test(username.toLowerCase())) {
        return NextResponse.json({
          success: false,
          message: "Username must be 3-20 characters, lowercase letters, numbers, and underscores only.",
        });
      }
      // Check uniqueness
      const { data: existing } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("username", username.toLowerCase())
        .neq("id", profile.id)
        .single();

      if (existing) {
        return NextResponse.json({
          success: false,
          message: `Username "${username}" is already taken. Please choose another.`,
        });
      }
      updates.username = username.toLowerCase();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: false,
        message: "No fields to update. Provide name, phone, or username.",
      });
    }

    const { error: updateErr } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", profile.id);

    if (updateErr) {
      console.error("Profile update error:", updateErr);
      return NextResponse.json({
        success: false,
        message: "Failed to update profile. Please try again.",
      }, { status: 500 });
    }

    const updatedFields = Object.keys(updates).join(", ");
    return NextResponse.json({
      success: true,
      message: `Profile updated successfully! Changed: ${updatedFields}.`,
      updated: updates,
    });
  } catch (error) {
    console.error("Bot update-profile error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
