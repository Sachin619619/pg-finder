import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// GET /api/user/dashboard - Get comprehensive user dashboard data
export async function GET(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "dashboard", 20);
  if (limited) return limited;

  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 401 });
  }

  try {
    // 1. Get user preferences
    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    // 2. Get user's bookings
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    // 3. Get scheduled visits
    const { data: visits } = await supabase
      .from("scheduled_visits")
      .select("*")
      .eq("user_id", userId)
      .gte("visit_date", new Date().toISOString().split("T")[0])
      .order("visit_date", { ascending: true })
      .limit(5);

    // 4. Get recent behavior summary
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data: recentBehavior } = await supabase
      .from("user_behavior")
      .select("action_type")
      .eq("user_id", userId)
      .gte("created_at", thirtyDaysAgo);

    const actionCounts = recentBehavior?.reduce((acc: Record<string, number>, b) => {
      acc[b.action_type] = (acc[b.action_type] || 0) + 1;
      return acc;
    }, {}) || {};

    // 5. Get wishlisted listings (from behavior)
    const wishlistPgIds = recentBehavior
      ?.filter((b) => b.action_type === "wishlist_add")
      .map((b) => b.pg_id) || [];

    const uniqueWishlist = [...new Set(wishlistPgIds)];

    // 6. Get notification preferences
    const { data: notifPrefs } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    // 7. Get viewed listings (for "Recently Viewed")
    const viewedPgIds = recentBehavior
      ?.filter((b) => b.action_type === "view" && b.pg_id)
      .map((b) => b.pg_id) || [];

    const recentlyViewed = [...new Set(viewedPgIds)].slice(0, 10);

    // 8. Calculate engagement score
    const engagementScore = Math.min(100, Math.round(
      (actionCounts['view'] || 0) * 1 +
      (actionCounts['click'] || 0) * 3 +
      (actionCounts['search'] || 0) * 2 +
      (actionCounts['wishlist_add'] || 0) * 5 +
      (actionCounts['booking_complete'] || 0) * 10
    ));

    // 9. Get profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    return NextResponse.json({
      profile: profile ? {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        role: profile.role,
        avatar: profile.avatar,
        memberSince: profile.created_at,
      } : null,
      preferences: preferences || {
        preferred_areas: [],
        preferred_gender: "any",
        min_budget: 0,
        max_budget: 100000,
      },
      stats: {
        totalSearches: actionCounts['search'] || 0,
        totalViews: actionCounts['view'] || 0,
        wishlistCount: uniqueWishlist.length,
        engagementScore,
      },
      recentBookings: bookings || [],
      upcomingVisits: visits || [],
      recentlyViewed,
      wishlist: uniqueWishlist.slice(0, 10),
      notificationPreferences: notifPrefs || {
        email_notifications: true,
        sms_notifications: true,
        whatsapp_notifications: false,
        visit_reminders: true,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}

// PUT /api/user/dashboard - Update dashboard settings
export async function PUT(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "dashboard", 10);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { userId, profile, preferences, notificationPrefs } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    // Update profile
    if (profile) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: profile.name,
          phone: profile.phone,
        })
        .eq("id", userId);

      if (profileError) {
        console.error("Update profile error:", profileError);
      }
    }

    // Update preferences
    if (preferences) {
      await supabase
        .from("user_preferences")
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });
    }

    // Update notification preferences
    if (notificationPrefs) {
      await supabase
        .from("notification_preferences")
        .upsert({
          user_id: userId,
          ...notificationPrefs,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dashboard update error:", error);
    return NextResponse.json({ error: "Failed to update dashboard" }, { status: 500 });
  }
}
