import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/reviews/manage - Get reviews for moderation/management
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const pgId = searchParams.get("pgId");
  const status = searchParams.get("status"); // pending, approved, flagged
  const limit = Math.min(Number(searchParams.get("limit")) || 20, 100);

  try {
    let query = supabase
      .from("reviews")
      .select("*")
      .order("date", { ascending: false })
      .limit(limit);

    if (pgId) {
      query = query.eq("pg_id", pgId);
    }

    if (status === "pending") {
      // Get unverified reviews or reviews with reports
      query = query.eq("verified", false);
    }

    const { data: reviews, error } = await query;

    if (error) {
      console.error("Get reviews error:", error);
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }

    // Get user info for each review
    const enrichedReviews = await Promise.all(
      (reviews || []).map(async (review) => {
        let userInfo = null;
        if (review.user_id) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("name, avatar")
            .eq("id", review.user_id)
            .single();
          userInfo = profile;
        }

        return {
          ...review,
          user: userInfo,
        };
      })
    );

    // Get review stats
    const { data: allReviews } = await supabase
      .from("reviews")
      .select("verified, report_count")
      .eq("pg_id", pgId || "");

    const stats = {
      total: allReviews?.length || 0,
      verified: allReviews?.filter((r) => r.verified).length || 0,
      flagged: allReviews?.filter((r) => (r.report_count || 0) > 0).length || 0,
      pending: allReviews?.filter((r) => !r.verified && (r.report_count || 0) === 0).length || 0,
    };

    return NextResponse.json({ reviews: enrichedReviews, stats });
  } catch (error) {
    console.error("Get reviews error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST /api/reviews/manage - Moderate reviews (admin/owner)
export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "reviews", 20);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { action, reviewId, adminResponse, userId } = body;

    if (!reviewId || !action) {
      return NextResponse.json({ error: "Review ID and action required" }, { status: 400 });
    }

    if (action === "verify") {
      // Mark review as verified
      const { error } = await supabase
        .from("reviews")
        .update({
          verified: true,
        })
        .eq("id", reviewId);

      if (error) {
        console.error("Verify review error:", error);
        return NextResponse.json({ error: "Failed to verify review" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Review verified" });
    }

    if (action === "respond") {
      // Add admin/owner response
      const { error } = await supabase
        .from("reviews")
        .update({
          admin_response: adminResponse,
          admin_response_date: new Date().toISOString(),
        })
        .eq("id", reviewId);

      if (error) {
        console.error("Respond to review error:", error);
        return NextResponse.json({ error: "Failed to add response" }, { status: 500 });
      }

      // Notify user?
      return NextResponse.json({ success: true, message: "Response added" });
    }

    if (action === "flag") {
      // Flag review for manual review
      const { error } = await supabase
        .from("reviews")
        .update({
          report_count: supabase.rpc("increment", { x: 1 }).then(() => 1).catch(() => 1),
        })
        .eq("id", reviewId);

      if (error) {
        console.error("Flag review error:", error);
        return NextResponse.json({ error: "Failed to flag review" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Review flagged" });
    }

    if (action === "hide") {
      // Hide review (soft delete)
      // This would require adding a hidden column
      return NextResponse.json({ error: "Hide action not implemented" }, { status: 501 });
    }

    if (action === "delete") {
      // Only admin or the user who wrote the review
      const { data: review } = await supabase
        .from("reviews")
        .select("user_id")
        .eq("id", reviewId)
        .single();

      if (!review) {
        return NextResponse.json({ error: "Review not found" }, { status: 404 });
      }

      // Check if user is admin or owns the review
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (profile?.role !== "admin" && review.user_id !== userId) {
        return NextResponse.json({ error: "Not authorized" }, { status: 403 });
      }

      const { error } = await supabase.from("reviews").delete().eq("id", reviewId);

      if (error) {
        console.error("Delete review error:", error);
        return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Review deleted" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Moderate review error:", error);
    return NextResponse.json({ error: "Failed to moderate review" }, { status: 500 });
  }
}

// PUT /api/reviews/manage - Update review (user)
export async function PUT(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "reviews", 10);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { reviewId, userId, rating, comment } = body;

    if (!reviewId || !userId) {
      return NextResponse.json({ error: "Review ID and User ID required" }, { status: 400 });
    }

    // Verify ownership
    const { data: review } = await supabase
      .from("reviews")
      .select("user_id")
      .eq("id", reviewId)
      .single();

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (review.user_id !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const updates: Record<string, unknown> = {
      date: new Date().toISOString().split("T")[0], // Update date
    };

    if (rating !== undefined) updates.rating = rating;
    if (comment !== undefined) updates.comment = comment;

    const { error } = await supabase.from("reviews").update(updates).eq("id", reviewId);

    if (error) {
      console.error("Update review error:", error);
      return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update review error:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}
