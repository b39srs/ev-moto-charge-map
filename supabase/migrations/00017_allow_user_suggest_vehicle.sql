-- ============================================================
-- Allow authenticated users to suggest new vehicle models
-- ============================================================

-- Track who added the model (NULL for admin-seeded models)
ALTER TABLE public.vehicle_models
  ADD COLUMN IF NOT EXISTS added_by UUID REFERENCES public.profiles(id);

-- Allow authenticated users to INSERT new vehicle models
-- (existing "Only admins can manage vehicle models" policy covers UPDATE/DELETE)
CREATE POLICY "Authenticated users can suggest vehicle models"
  ON public.vehicle_models FOR INSERT TO authenticated
  WITH CHECK (true);

-- Ensure proper grants
GRANT SELECT ON public.vehicle_models TO anon, authenticated;
GRANT INSERT ON public.vehicle_models TO authenticated;
