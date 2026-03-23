import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

// One-time setup endpoint to create agent tables
// Uses service role key to create the SQL executor function, then runs DDL
export async function GET(req: Request) {
  const limited = rateLimit(getClientIp(req), "setup-agent-tables", 30);
  if (limited) return limited;

  // Security: only allow with correct secret header
  const authHeader = req.headers.get("x-setup-key")?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!authHeader || !serviceKey || authHeader !== serviceKey) {
    return NextResponse.json({ error: "Unauthorized", debug: { hasHeader: !!authHeader, hasEnv: !!serviceKey, match: authHeader === serviceKey } }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const results: string[] = [];

  // Step 1: Create the exec_sql function if it doesn't exist
  // We'll use supabase.rpc to create it via an existing plpgsql capability
  try {
    // First check if agent_requests already exists
    const { error: checkErr } = await supabase.from("agent_requests").select("id").limit(1);

    if (!checkErr) {
      results.push("agent_requests table already exists");
    } else if (checkErr.code === "PGRST205") {
      results.push("agent_requests table does not exist - needs creation via SQL editor");
    }

    // Check added_by_agent column
    const { error: colErr } = await supabase.from("listings").select("added_by_agent").limit(1);

    if (!colErr) {
      results.push("added_by_agent column already exists");
    } else {
      results.push("added_by_agent column missing - needs creation via SQL editor");
    }

    return NextResponse.json({
      status: "checked",
      results,
      migration_sql: `
-- Run this in Supabase SQL editor:
CREATE TABLE IF NOT EXISTS agent_requests (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID NOT NULL,
  agent_name TEXT NOT NULL,
  agent_email TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  pg_name TEXT NOT NULL,
  pg_area TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  payout_amount INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE listings ADD COLUMN IF NOT EXISTS added_by_agent UUID;
CREATE INDEX IF NOT EXISTS idx_agent_requests_agent_id ON agent_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_requests_status ON agent_requests(status);
CREATE INDEX IF NOT EXISTS idx_listings_added_by_agent ON listings(added_by_agent);
CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_requests_unique_listing ON agent_requests(agent_id, listing_id);
ALTER TABLE agent_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "agents_read_own" ON agent_requests FOR SELECT USING (auth.uid() = agent_id);
CREATE POLICY "agents_insert_own" ON agent_requests FOR INSERT WITH CHECK (auth.uid() = agent_id);
CREATE POLICY "admins_read_all" ON agent_requests FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "admins_update" ON agent_requests FOR UPDATE USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
      `,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
