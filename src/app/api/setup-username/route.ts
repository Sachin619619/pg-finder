import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const limited = rateLimit(getClientIp(req), "setup-username", 30);
  if (limited) return limited;

  const results: Record<string, string> = {};

  // 1. Add username column to profiles
  const { error: e1 } = await supabase.from("profiles").select("username").limit(1);
  if (e1?.message?.includes("column") || e1?.message?.includes("does not exist")) {
    // Column doesn't exist — we need to add it via a workaround
    results.username_col = "needs_manual_migration";
  } else {
    results.username_col = "exists";
  }

  // 2. Create claim_notifications table by inserting a test row
  const { error: e2 } = await supabase.from("claim_notifications").select("id").limit(1);
  if (e2) {
    results.claim_notifications = "needs_manual_migration: " + e2.message;
  } else {
    results.claim_notifications = "exists";
  }

  return NextResponse.json({ results, note: "Run supabase-username-migration.sql in SQL Editor if tables need creation" });
}
