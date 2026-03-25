-- ==========================================
-- Castle Living - Enhanced PG Finder Schema
-- Advanced tables for smart features
-- ==========================================

-- 1. User Preferences - Store tenant search preferences for recommendations
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_areas TEXT[] DEFAULT '{}',
  preferred_gender TEXT DEFAULT 'any',
  min_budget INTEGER DEFAULT 0,
  max_budget INTEGER DEFAULT 100000,
  preferred_amenities TEXT[] DEFAULT '{}',
  room_type_pref TEXT DEFAULT 'any',
  has_pets BOOLEAN DEFAULT false,
  dietary_requirements TEXT[] DEFAULT '{}',
  lifestyle_preferences TEXT[] DEFAULT '{}',
  work_area TEXT DEFAULT '',
  commute_distance_max INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. User Behavior Tracking - Track user interactions for better recommendations
CREATE TABLE IF NOT EXISTS user_behavior (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pg_id TEXT,
  action_type TEXT NOT NULL CHECK (action_type IN (
    'view', 'click', 'search', 'wishlist_add', 'wishlist_remove',
    'booking_start', 'booking_complete', 'visit_scheduled', 'visit_completed',
    'review_submit', 'share', 'compare', 'filter_apply'
  )),
  metadata JSONB DEFAULT '{}',
  session_id TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_behavior ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own behavior" ON user_behavior FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own behavior" ON user_behavior FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can view all behavior" ON user_behavior FOR SELECT USING (auth.role() = 'service_role');

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_user_behavior_user ON user_behavior(user_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_action ON user_behavior(action_type);
CREATE INDEX IF NOT EXISTS idx_user_behavior_pg ON user_behavior(pg_id);
CREATE INDEX IF NOT EXISTS idx_user_behavior_created ON user_behavior(created_at);

-- 3. Listing Quality Scores - Automated verification and scoring
CREATE TABLE IF NOT EXISTS listing_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id TEXT NOT NULL,
  overall_score DECIMAL(3,2) DEFAULT 0.00 CHECK (overall_score >= 0 AND overall_score <= 5.00),
  price_score DECIMAL(3,2) DEFAULT 0.00 CHECK (price_score >= 0 AND price_score <= 5.00),
  amenity_score DECIMAL(3,2) DEFAULT 0.00 CHECK (amenity_score >= 0 AND amenity_score <= 5.00),
  location_score DECIMAL(3,2) DEFAULT 0.00 CHECK (location_score >= 0 AND location_score <= 5.00),
  hygiene_score DECIMAL(3,2) DEFAULT 0.00 CHECK (hygiene_score >= 0 AND hygiene_score <= 5.00),
  verified_status TEXT DEFAULT 'pending' CHECK (verified_status IN ('pending', 'verified', 'rejected', 'needs_review')),
  verification_flags TEXT[] DEFAULT '{}',
  last_verified_at TIMESTAMPTZ,
  next_verification_due TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pg_id)
);

ALTER TABLE listing_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view listing scores" ON listing_scores FOR SELECT USING (true);
CREATE POLICY "Service role can manage scores" ON listing_scores FOR ALL USING (auth.role() = 'service_role');

-- 4. Visit Slots - Manage PG visit scheduling
CREATE TABLE IF NOT EXISTS visit_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id TEXT NOT NULL,
  slot_date DATE NOT NULL,
  slot_time TEXT NOT NULL,
  max_visitors INTEGER DEFAULT 5,
  current_visitors INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(pg_id, slot_date, slot_time)
);

ALTER TABLE visit_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view available slots" ON visit_slots FOR SELECT USING (true);
CREATE POLICY "Authenticated users can book slots" ON visit_slots FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "PG owners can manage slots" ON visit_slots FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM listings WHERE listings.id = visit_slots.pg_id AND listings.owner_id = auth.uid()
  )
);

CREATE INDEX IF NOT EXISTS idx_visit_slots_pg ON visit_slots(pg_id);
CREATE INDEX IF NOT EXISTS idx_visit_slots_date ON visit_slots(slot_date);

-- 5. Scheduled Visits - Track booked visits
CREATE TABLE IF NOT EXISTS scheduled_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES visit_slots(id),
  visit_date DATE NOT NULL,
  visit_time TEXT NOT NULL,
  visitor_name TEXT NOT NULL,
  visitor_phone TEXT NOT NULL,
  visitor_email TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  reminder_sent BOOLEAN DEFAULT false,
  feedback TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scheduled_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own visits" ON scheduled_visits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create visits" ON scheduled_visits FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own visits" ON scheduled_visits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "PG owners can view visits for their PGs" ON scheduled_visits FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM listings WHERE listings.id = scheduled_visits.pg_id AND listings.owner_id = auth.uid()
  )
);

CREATE INDEX IF NOT EXISTS idx_scheduled_visits_user ON scheduled_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_pg ON scheduled_visits(pg_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_visits_date ON scheduled_visits(visit_date);

-- 6. Price History - Track price changes for analytics
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id TEXT NOT NULL,
  price INTEGER NOT NULL,
  room_type TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view price history" ON price_history FOR SELECT USING (true);
CREATE POLICY "Service role can insert prices" ON price_history FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_price_history_pg ON price_history(pg_id);
CREATE INDEX IF NOT EXISTS idx_price_history_date ON price_history(recorded_at);

-- 7. Area Analytics - Aggregated area statistics
CREATE TABLE IF NOT EXISTS area_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area TEXT NOT NULL,
  avg_price DECIMAL(10,2) DEFAULT 0,
  min_price INTEGER DEFAULT 0,
  max_price INTEGER DEFAULT 0,
  total_listings INTEGER DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  price_trend TEXT DEFAULT 'stable' CHECK (price_trend IN ('rising', 'falling', 'stable')),
  trend_percentage DECIMAL(5,2) DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(area)
);

ALTER TABLE area_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view area analytics" ON area_analytics FOR SELECT USING (true);
CREATE POLICY "Service role can update analytics" ON area_analytics FOR ALL USING (auth.role() = 'service_role');

-- 8. Notification Preferences - User notification settings
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT true,
  whatsapp_notifications BOOLEAN DEFAULT false,
  push_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  visit_reminders BOOLEAN DEFAULT true,
  price_alert_frequency TEXT DEFAULT 'daily' CHECK (price_alert_frequency IN ('instant', 'daily', 'weekly')),
  preferred_contact_time TEXT DEFAULT 'any',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own preferences" ON notification_preferences FOR ALL USING (auth.uid() = user_id);

-- 9. WhatsApp Sessions - Track WhatsApp integration
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  is_verified BOOLEAN DEFAULT false,
  verification_code TEXT,
  verification_expires_at TIMESTAMPTZ,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sessions" ON notification_preferences FOR ALL USING (auth.uid() = user_id);

-- 10. Notification Log - Track all sent notifications
CREATE TABLE IF NOT EXISTS notification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'booking_confirmation', 'visit_reminder', 'price_alert', 'whatsapp_message',
    'sms_message', 'email', 'marketing'
  )),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp', 'push')),
  recipient TEXT NOT NULL,
  subject TEXT,
  content TEXT,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'failed', 'bounced')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON notification_log FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all" ON notification_log FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_notification_log_user ON notification_log(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_type ON notification_log(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_log_created ON notification_log(created_at);

-- 11. Smart Recommendations Cache - Pre-computed recommendations
CREATE TABLE IF NOT EXISTS recommendations_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendations JSONB NOT NULL,
  recommendation_type TEXT DEFAULT 'personalized' CHECK (recommendation_type IN ('personalized', 'trending', 'similar')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recommendation_type)
);

ALTER TABLE recommendations_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recommendations" ON recommendations_cache FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage" ON recommendations_cache FOR ALL USING (auth.role() = 'service_role');

-- ==========================================
-- Enhanced Listings Table Columns
-- ==========================================

-- Add missing columns to listings if they don't exist
DO $$ BEGIN
  ALTER TABLE listings ADD COLUMN IF NOT EXISTS owner_id UUID;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE listings ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified' 
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE listings ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE listings ADD COLUMN IF NOT EXISTS search_count INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE listings ADD COLUMN IF NOT EXISTS booking_count INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE listings ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,2) DEFAULT 0.00;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE listings ADD COLUMN IF NOT EXISTS response_rate DECIMAL(5,2) DEFAULT 0.00;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE listings ADD COLUMN IF NOT EXISTS avg_response_time INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ==========================================
-- Enhanced Bookings Table Columns
-- ==========================================

DO $$ BEGIN
  ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room_number TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_amount INTEGER;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' 
    CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE bookings ADD COLUMN IF NOT EXISTS move_in_date_actual DATE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE bookings ADD COLUMN IF NOT EXISTS move_out_date DATE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE bookings ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ==========================================
-- Enhanced Reviews Table Columns
-- ==========================================

DO $$ BEGIN
  ALTER TABLE reviews ADD COLUMN IF NOT EXISTS admin_response TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE reviews ADD COLUMN IF NOT EXISTS admin_response_date TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE reviews ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_type TEXT DEFAULT 'tenant' 
    CHECK (review_type IN ('tenant', 'resident', 'former', 'owner'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ==========================================
-- Useful Views for Analytics
-- ==========================================

-- View: Popular listings by area
CREATE OR REPLACE VIEW popular_listings AS
SELECT 
  area,
  COUNT(*) as total_listings,
  AVG(price) as avg_price,
  AVG(rating) as avg_rating,
  SUM(view_count) as total_views,
  SUM(booking_count) as total_bookings
FROM listings
WHERE status = 'active'
GROUP BY area;

-- View: User engagement metrics
CREATE OR REPLACE VIEW user_engagement AS
SELECT 
  DATE(created_at) as date,
  action_type,
  COUNT(*) as action_count,
  COUNT(DISTINCT user_id) as unique_users
FROM user_behavior
GROUP BY DATE(created_at), action_type;

-- ==========================================
-- Functions for Automated Tasks
-- ==========================================

-- Function: Update listing conversion rate
CREATE OR REPLACE FUNCTION update_listing_conversion(pg_id TEXT)
RETURNS VOID AS $$
DECLARE
  views INTEGER;
  bookings INTEGER;
BEGIN
  SELECT view_count INTO views FROM listings WHERE id = pg_id;
  SELECT COUNT(*) INTO bookings FROM scheduled_visits WHERE pg_id = pg_id AND status = 'completed';
  
  IF views > 0 THEN
    UPDATE listings 
    SET conversion_rate = (bookings::DECIMAL / views::DECIMAL) * 100
    WHERE id = pg_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function: Get personalized recommendations
CREATE OR REPLACE FUNCTION get_recommendations(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  area TEXT,
  price INTEGER,
  rating DECIMAL(3,2),
  match_score DECIMAL(3,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.name,
    l.area,
    l.price,
    l.rating,
    (
      CASE WHEN l.area = ANY(SELECT preferred_areas FROM user_preferences WHERE user_id = p_user_id) THEN 2 ELSE 0 END +
      CASE WHEN l.price BETWEEN (SELECT min_budget FROM user_preferences WHERE user_id = p_user_id) 
                           AND (SELECT max_budget FROM user_preferences WHERE user_id = p_user_id) THEN 2 ELSE 0 END +
      CASE WHEN l.rating >= 4.0 THEN 1 ELSE 0 END
    )::DECIMAL / 5.0 * 100 AS match_score
  FROM listings l
  WHERE l.status = 'active'
  ORDER BY match_score DESC, l.rating DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Additional Tables for Advanced Features
-- ==========================================

-- Saved Searches - User saved search configurations
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  search_params JSONB DEFAULT '{}',
  alert_enabled BOOLEAN DEFAULT false,
  last_run_at TIMESTAMPTZ,
  result_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own searches" ON saved_searches FOR ALL USING (auth.uid() = user_id);

-- Room Reservations - Temporary room holds
CREATE TABLE IF NOT EXISTS room_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  room_type TEXT NOT NULL,
  move_in_date DATE NOT NULL,
  duration_months INTEGER DEFAULT 1,
  status TEXT DEFAULT 'held' CHECK (status IN ('held', 'confirmed', 'cancelled', 'expired')),
  expires_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE room_reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own reservations" ON room_reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reservations" ON room_reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reservations" ON room_reservations FOR UPDATE USING (auth.uid() = user_id);

-- Index for room availability queries
CREATE INDEX IF NOT EXISTS idx_room_reservations_pg ON room_reservations(pg_id);
CREATE INDEX IF NOT EXISTS idx_room_reservations_status ON room_reservations(status);
CREATE INDEX IF NOT EXISTS idx_room_reservations_expires ON room_reservations(expires_at);

-- Enhanced price_alerts table
DO $$ BEGIN
  ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS last_alert_sent_at TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE price_alerts ADD COLUMN IF NOT EXISTS alert_frequency TEXT DEFAULT 'daily' 
    CHECK (alert_frequency IN ('instant', 'daily', 'weekly'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ==========================================
-- User Onboarding Tracking
-- ==========================================

CREATE TABLE IF NOT EXISTS user_onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  profile_created BOOLEAN DEFAULT false,
  preferences_set BOOLEAN DEFAULT false,
  first_search BOOLEAN DEFAULT false,
  first_view BOOLEAN DEFAULT false,
  first_wishlist BOOLEAN DEFAULT false,
  first_visit_scheduled BOOLEAN DEFAULT false,
  first_booking BOOLEAN DEFAULT false,
  profile_created_at TIMESTAMPTZ,
  preferences_set_at TIMESTAMPTZ,
  first_search_at TIMESTAMPTZ,
  first_view_at TIMESTAMPTZ,
  first_wishlist_at TIMESTAMPTZ,
  first_visit_scheduled_at TIMESTAMPTZ,
  first_booking_at TIMESTAMPTZ,
  current_step TEXT DEFAULT 'profile_created',
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own onboarding" ON user_onboarding FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own onboarding" ON user_onboarding FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all" ON user_onboarding FOR ALL USING (auth.role() = 'service_role');

-- ==========================================
-- Share Links and Tracking
-- ==========================================

CREATE TABLE IF NOT EXISTS share_links (
  id TEXT PRIMARY KEY,
  pg_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  medium TEXT DEFAULT 'direct',
  campaign TEXT,
  click_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view share links" ON share_links FOR SELECT USING (true);
CREATE POLICY "Anyone can create share links" ON share_links FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update" ON share_links FOR UPDATE USING (auth.role() = 'service_role');

-- ==========================================
-- Notification Failures Log
-- ==========================================

CREATE TABLE IF NOT EXISTS notification_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  message_sid TEXT,
  recipient TEXT,
  error_code TEXT,
  error_message TEXT,
  failed_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notification_failures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role can manage" ON notification_failures FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_notification_failures_provider ON notification_failures(provider);
CREATE INDEX IF NOT EXISTS idx_notification_failures_recipient ON notification_failures(recipient);

-- ==========================================
-- Refund Requests
-- ==========================================

CREATE TABLE IF NOT EXISTS refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER DEFAULT 0,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'not_applicable')),
  refund_policy TEXT,
  transaction_id TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

ALTER TABLE refund_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own refund requests" ON refund_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create refund requests" ON refund_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role can manage all" ON refund_requests FOR ALL USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_refund_requests_booking ON refund_requests(booking_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON refund_requests(status);
