-- ============================================================
-- Migration 00016: Redesign Compatibility System
-- ============================================================
-- Drops the old compatibility_reports table (migration 00007)
-- and its enums, then creates the new schema based on the
-- approved Community Compatibility architecture.
--
-- BREAKING: This migration destroys old compatibility data.
-- No production data exists — safe to run.
-- ============================================================

-- Step 1: Drop old structure
-- (RLS policies cascade-drop with the table)
DROP INDEX IF EXISTS idx_compat_reports_location;
DROP INDEX IF EXISTS idx_compat_reports_vehicle;
DROP INDEX IF EXISTS idx_compat_reports_user;

DROP POLICY IF EXISTS "Reports are publicly readable" ON public.compatibility_reports;
DROP POLICY IF EXISTS "Authenticated users can add reports" ON public.compatibility_reports;

DROP TABLE IF EXISTS public.compatibility_reports;
DROP TYPE IF EXISTS compatibility_status;
DROP TYPE IF EXISTS charge_result;

-- ============================================================
-- Step 2: Create compatibility_reports (append-only event log)
-- ============================================================
CREATE TABLE public.compatibility_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.charging_locations(id) ON DELETE CASCADE,
  vehicle_model_id UUID NOT NULL REFERENCES public.vehicle_models(id) ON DELETE CASCADE,
  connector_id UUID REFERENCES public.location_connectors(id) ON DELETE SET NULL,

  -- Outcome: did charging succeed?
  outcome TEXT NOT NULL CHECK (outcome IN ('success', 'failed')),

  -- Reason: why did it fail? (NULL when outcome = 'success')
  reason TEXT CHECK (reason IN (
    'incompatible_connector',
    'station_offline',
    'power_limit',
    'adapter_required',
    'unknown',
    'other'
  )),

  -- Charging details (nullable — optional enrichment data)
  charging_speed_kw DECIMAL(5,2),
  charge_duration_min INTEGER,
  battery_before_pct SMALLINT CHECK (battery_before_pct BETWEEN 0 AND 100),
  battery_after_pct SMALLINT CHECK (battery_after_pct BETWEEN 0 AND 100),
  adapter_used BOOLEAN NOT NULL DEFAULT false,

  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- No updated_at — reports are immutable

-- ============================================================
-- Step 3: Create compatibility_summaries (pre-computed lookup)
-- ============================================================
CREATE TABLE public.compatibility_summaries (
  vehicle_model_id UUID NOT NULL REFERENCES public.vehicle_models(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.charging_locations(id) ON DELETE CASCADE,

  total_reports INTEGER NOT NULL DEFAULT 0 CHECK (total_reports >= 0),
  success_count INTEGER NOT NULL DEFAULT 0 CHECK (success_count >= 0),
  failed_count INTEGER NOT NULL DEFAULT 0 CHECK (failed_count >= 0),
  unique_reporters INTEGER NOT NULL DEFAULT 0 CHECK (unique_reporters >= 0),

  -- 0=no_data, 1=single_report, 2=community_verified, 3=highly_verified, 4=stale
  verification_level SMALLINT NOT NULL DEFAULT 0 CHECK (verification_level BETWEEN 0 AND 4),

  last_report_at TIMESTAMPTZ,
  last_success_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  PRIMARY KEY (vehicle_model_id, location_id)
);

-- ============================================================
-- Step 4: Indexes
-- ============================================================

-- compatibility_reports indexes
CREATE INDEX idx_cr_location_model_date
  ON public.compatibility_reports (location_id, vehicle_model_id, created_at DESC);

CREATE INDEX idx_cr_user
  ON public.compatibility_reports (user_id, created_at DESC);

CREATE INDEX idx_cr_model_outcome
  ON public.compatibility_reports (vehicle_model_id, outcome);

CREATE INDEX idx_cr_created
  ON public.compatibility_reports (created_at DESC);

-- Duplicate prevention: one report per user per model per station per calendar day
CREATE UNIQUE INDEX idx_cr_no_duplicate
  ON public.compatibility_reports (user_id, location_id, vehicle_model_id, (created_at::date));

-- compatibility_summaries indexes (PK already covers (vehicle_model_id, location_id))
CREATE INDEX idx_cs_location
  ON public.compatibility_summaries (location_id);

CREATE INDEX idx_cs_model_verified
  ON public.compatibility_summaries (vehicle_model_id, verification_level DESC);

-- ============================================================
-- Step 5: RLS Policies
-- ============================================================

ALTER TABLE public.compatibility_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compatibility_summaries ENABLE ROW LEVEL SECURITY;

-- Reports: anyone can read, authenticated users can insert their own
CREATE POLICY "Compatibility reports are publicly readable"
  ON public.compatibility_reports FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add compatibility reports"
  ON public.compatibility_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Summaries: anyone can read, authenticated users can manage (application-controlled)
CREATE POLICY "Compatibility summaries are publicly readable"
  ON public.compatibility_summaries FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can upsert compatibility summaries"
  ON public.compatibility_summaries FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update compatibility summaries"
  ON public.compatibility_summaries FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- ============================================================
-- Step 6: GRANTs
-- ============================================================
-- Required for Supabase — RLS policies alone are not enough

GRANT SELECT ON public.compatibility_reports TO anon, authenticated;
GRANT INSERT ON public.compatibility_reports TO authenticated;

GRANT SELECT ON public.compatibility_summaries TO anon, authenticated;
GRANT INSERT, UPDATE ON public.compatibility_summaries TO authenticated;
