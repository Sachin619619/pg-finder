import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// POST /api/user/onboarding - Complete onboarding step
export async function POST(req: NextRequest) {
  const limited = rateLimit(getClientIp(req), "onboarding", 10);
  if (limited) return limited;

  try {
    const body = await req.json();
    const { userId, step, data } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 401 });
    }

    const validSteps = [
      "profile_created",
      "preferences_set",
      "first_search",
      "first_view",
      "first_wishlist",
      "first_visit_scheduled",
      "first_booking",
    ];

    if (!validSteps.includes(step)) {
      return NextResponse.json({ error: "Invalid step" }, { status: 400 });
    }

    // Track onboarding progress
    const stepData: Record<string, unknown> = {};
    stepData[step] = true;
    stepData[`${step}_at`] = new Date().toISOString();

    // Update or create onboarding record
    const { error } = await supabase
      .from("user_onboarding")
      .upsert({
        user_id: userId,
        ...stepData,
        current_step: step,
        data: data || {},
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error("Onboarding update error:", error);
      return NextResponse.json({ error: "Failed to update onboarding" }, { status: 500 });
    }

    // Calculate onboarding completion percentage
    const completion = calculateCompletion(step);

    return NextResponse.json({
      success: true,
      step,
      completion,
      nextStep: getNextStep(step),
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Failed to process onboarding" }, { status: 500 });
  }
}

// GET /api/user/onboarding - Get user's onboarding status
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID required" }, { status: 401 });
  }

  try {
    const { data: onboarding, error } = await supabase
      .from("user_onboarding")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Get onboarding error:", error);
      return NextResponse.json({ error: "Failed to fetch onboarding" }, { status: 500 });
    }

    if (!onboarding) {
      return NextResponse.json({
        onboarding: null,
        completedSteps: [],
        currentStep: "profile_created",
        completion: 0,
        nextStep: "preferences_set",
      });
    }

    const completedSteps = validSteps.filter((step) => onboarding[step]);
    const completion = calculateCompletion(onboarding.current_step);

    return NextResponse.json({
      onboarding,
      completedSteps,
      currentStep: onboarding.current_step,
      completion,
      nextStep: getNextStep(onboarding.current_step),
    });
  } catch (error) {
    console.error("Get onboarding error:", error);
    return NextResponse.json({ error: "Failed to fetch onboarding" }, { status: 500 });
  }
}

function calculateCompletion(currentStep: string): number {
  const stepIndex = validSteps.indexOf(currentStep);
  return Math.round(((stepIndex + 1) / validSteps.length) * 100);
}

function getNextStep(currentStep: string): string | null {
  const currentIndex = validSteps.indexOf(currentStep);
  if (currentIndex < validSteps.length - 1) {
    return validSteps[currentIndex + 1];
  }
  return null; // All steps completed
}

const validSteps = [
  "profile_created",
  "preferences_set",
  "first_search",
  "first_view",
  "first_wishlist",
  "first_visit_scheduled",
  "first_booking",
];
