import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/share - Create a shareable link for a listing
export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "share", 30);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { pgId, userId, medium, campaign } = body;

    if (!pgId) {
      return NextResponse.json({ error: "PG ID required" }, { status: 400 });
    }

    // Generate a unique share ID
    const shareId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Store share record
    const { error } = await supabase.from("share_links").insert({
      id: shareId,
      pg_id: pgId,
      user_id: userId || null,
      medium: medium || "direct",
      campaign: campaign || null,
      click_count: 0,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Create share link error:", error);
      // Fallback - just return a basic URL
    }

    // Generate the share URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://castleliving.in";
    const shareUrl = `${baseUrl}/listing/${pgId}?ref=${shareId}`;

    // Generate OG image URL (for social sharing)
    const ogImageUrl = `${baseUrl}/api/og/${pgId}`;

    // Create share text
    const { data: listing } = await supabase
      .from("listings")
      .select("name, area, price")
      .eq("id", pgId)
      .single();

    const shareText = listing
      ? `Check out ${listing.name} in ${listing.area} - ₹${listing.price?.toLocaleString()}/month on Castle Living!`
      : "Check out this PG on Castle Living!";

    // Generate social share URLs
    const socialShares = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    };

    return NextResponse.json({
      shareId,
      shareUrl,
      ogImageUrl,
      shareText,
      socialShares,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    });
  } catch (error) {
    console.error("Share error:", error);
    return NextResponse.json({ error: "Failed to create share link" }, { status: 500 });
  }
}

// GET /api/share - Track share click and redirect
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const shareId = searchParams.get("id");
  const redirect = searchParams.get("redirect");

  if (!shareId) {
    return NextResponse.json({ error: "Share ID required" }, { status: 400 });
  }

  // Track click
  await supabase.rpc("increment_share_clicks", { share_id: shareId }).catch(() => {});

  if (redirect === "true") {
    // Get the original PG ID and redirect
    const { data: share } = await supabase
      .from("share_links")
      .select("pg_id")
      .eq("id", shareId)
      .single();

    if (share) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://castleliving.in";
      return NextResponse.redirect(`${baseUrl}/listing/${share.pg_id}?ref=${shareId}`);
    }
  }

  return NextResponse.json({ success: true, shareId });
}
