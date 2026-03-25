import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { fetchListings } from "@/lib/db";

// GET /api/health - Health check endpoint
export async function GET(req: NextRequest) {
  const start = Date.now();

  try {
    // Check Supabase connection
    const { error: supabaseError } = await supabase.from("profiles").select("id").limit(1);

    // Check listings data
    const listings = await fetchListings();

    // Check environment variables
    const envStatus = {
      supabase: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      sendgrid: !!process.env.SENDGRID_API_KEY,
      twilio: !!process.env.TWILIO_ACCOUNT_SID,
      minimax: !!process.env.MINIMAX_API_KEY,
    };

    const responseTime = Date.now() - start;

    const health = {
      status: supabaseError ? "degraded" : "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      services: {
        database: supabaseError ? "error" : "ok",
        api: "ok",
      },
      data: {
        totalListings: listings.length,
        envConfigured: Object.values(envStatus).filter(Boolean).length,
      },
      environment: envStatus,
    };

    return NextResponse.json(health, {
      status: supabaseError ? 503 : 200,
    });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json({
      status: "error",
      timestamp: new Date().toISOString(),
      error: "Health check failed",
    }, { status: 500 });
  }
}

// POST /api/health - Readiness check (for Kubernetes, etc.)
export async function POST(req: NextRequest) {
  return GET(req);
}
