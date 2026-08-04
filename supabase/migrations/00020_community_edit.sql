-- =============================================================
-- Community Edit — ทุกคนแก้ไขสถานีได้ + เก็บประวัติการแก้ไข
-- =============================================================

-- 1. Edit history table
CREATE TABLE public.station_edit_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES public.charging_locations(id) ON DELETE CASCADE,
  editor_id UUID NOT NULL REFERENCES public.profiles(id),
  changes JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_edit_history_location ON public.station_edit_history(location_id, created_at DESC);

-- 2. Add last_edited columns to charging_locations
ALTER TABLE public.charging_locations
  ADD COLUMN last_edited_by UUID REFERENCES public.profiles(id),
  ADD COLUMN last_edited_at TIMESTAMPTZ;

-- 3. Update RLS: allow any authenticated user to update stations
DROP POLICY IF EXISTS "Users can update own locations" ON public.charging_locations;
CREATE POLICY "Authenticated users can update locations"
  ON public.charging_locations FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- 4. RLS for station_edit_history
ALTER TABLE public.station_edit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Edit history is publicly readable"
  ON public.station_edit_history FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert edit history"
  ON public.station_edit_history FOR INSERT
  WITH CHECK (auth.uid() = editor_id);

-- 5. Grants
GRANT SELECT, INSERT ON public.station_edit_history TO anon, authenticated;
