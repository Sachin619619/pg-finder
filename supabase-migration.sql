-- ==========================================
-- PG Finder — Supabase Migration Script
-- Run this in Supabase SQL Editor
-- ==========================================

-- 1. Profiles table (for auth users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  role TEXT DEFAULT 'tenant' CHECK (role IN ('tenant', 'owner', 'admin')),
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Anyone can insert profile" ON profiles FOR INSERT WITH CHECK (true);

-- 2. Messages table (for tenant-owner chat)
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id TEXT NOT NULL,
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages are viewable by all" ON messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 3. Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT,
  user_phone TEXT,
  move_in_date TEXT,
  room_type TEXT,
  duration_months INTEGER DEFAULT 1,
  notes TEXT,
  total_amount INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- 4. Create storage bucket for PG photos
INSERT INTO storage.buckets (id, name, public) VALUES ('pg-photos', 'pg-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public photo access" ON storage.objects FOR SELECT USING (bucket_id = 'pg-photos');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pg-photos' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own photos" ON storage.objects FOR DELETE USING (bucket_id = 'pg-photos' AND auth.uid() IS NOT NULL);

-- 5. Add verified column to reviews if not exists
DO $$ BEGIN
  ALTER TABLE reviews ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 6. Ensure price_alerts has created_at
DO $$ BEGIN
  ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 7. Ensure callbacks has created_at and status
DO $$ BEGIN
  ALTER TABLE callbacks ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
  ALTER TABLE callbacks ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- 8. Create demo accounts (run after enabling email auth in Supabase)
-- Admin: admin@castle.app / demo123
-- Owner: owner@castle.app / demo123
-- Tenant: tenant@castle.app / demo123
-- Note: Create these users via Supabase Auth dashboard or signUp API, then insert profiles:

-- INSERT INTO profiles (id, email, name, role) VALUES
--   ('admin-uuid-here', 'admin@castle.app', 'Admin', 'admin'),
--   ('owner-uuid-here', 'owner@castle.app', 'PG Owner', 'owner'),
--   ('tenant-uuid-here', 'tenant@castle.app', 'Demo Tenant', 'tenant');
