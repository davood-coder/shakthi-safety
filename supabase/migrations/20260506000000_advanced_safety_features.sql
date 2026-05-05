-- Migration for Advanced Safety Features
-- 1. Live Location Tracking
-- 2. Timer-based Safety Checks

-- Table for storing periodic location updates (Live Tracking)
CREATE TABLE IF NOT EXISTS public.user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accuracy DOUBLE PRECISION,
  speed DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

-- Table for Safety Timers
CREATE TABLE IF NOT EXISTS public.safety_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed, triggered
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.safety_checks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  -- User Locations Policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_locations' AND policyname = 'Users can view own locations'
  ) THEN
    CREATE POLICY "Users can view own locations" ON public.user_locations FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'user_locations' AND policyname = 'Users can insert own locations'
  ) THEN
    CREATE POLICY "Users can insert own locations" ON public.user_locations FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Safety Checks Policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'safety_checks' AND policyname = 'Users can view own checks'
  ) THEN
    CREATE POLICY "Users can view own checks" ON public.safety_checks FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'safety_checks' AND policyname = 'Users can insert own checks'
  ) THEN
    CREATE POLICY "Users can insert own checks" ON public.safety_checks FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'safety_checks' AND policyname = 'Users can update own checks'
  ) THEN
    CREATE POLICY "Users can update own checks" ON public.safety_checks FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;
