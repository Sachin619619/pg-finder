-- Castle Agent System Migration
-- Run this in your Supabase SQL editor

-- 1. Add agent_requests table for tracking agent onboarding and payouts
CREATE TABLE IF NOT EXISTS agent_requests (
  id BIGSERIAL PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- 2. Add added_by_agent column to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS added_by_agent UUID REFERENCES auth.users(id);

-- 3. Create index for faster agent queries
CREATE INDEX IF NOT EXISTS idx_agent_requests_agent_id ON agent_requests(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_requests_status ON agent_requests(status);
CREATE INDEX IF NOT EXISTS idx_listings_added_by_agent ON listings(added_by_agent);

-- 4. Unique constraint: one payout request per listing per agent (prevent duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_agent_requests_unique_listing ON agent_requests(agent_id, listing_id);

-- 5. Enable RLS (Row Level Security)
ALTER TABLE agent_requests ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies for agent_requests
-- Agents can read their own requests
CREATE POLICY "Agents can read own requests"
  ON agent_requests FOR SELECT
  USING (auth.uid() = agent_id);

-- Agents can insert their own requests
CREATE POLICY "Agents can insert own requests"
  ON agent_requests FOR INSERT
  WITH CHECK (auth.uid() = agent_id);

-- Admins can read all requests
CREATE POLICY "Admins can read all requests"
  ON agent_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Admins can update requests (approve/reject/mark paid)
CREATE POLICY "Admins can update requests"
  ON agent_requests FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
