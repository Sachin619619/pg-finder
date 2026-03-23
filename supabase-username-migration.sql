-- ==========================================
-- Username + Claim Notifications Migration
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Add username column to profiles (unique, lowercase)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- 2. Claim notifications table (agent sends claim to owner in-app)
CREATE TABLE IF NOT EXISTS claim_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id TEXT NOT NULL,
  listing_name TEXT NOT NULL,
  listing_area TEXT NOT NULL,
  claim_code TEXT NOT NULL,
  agent_id UUID NOT NULL,
  agent_name TEXT NOT NULL,
  owner_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE claim_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own claim notifications" ON claim_notifications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert claim notifications" ON claim_notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own claim notifications" ON claim_notifications FOR UPDATE USING (true);
