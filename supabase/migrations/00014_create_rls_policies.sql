-- Enable RLS on ALL tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charging_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connector_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compatibility_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edit_suggestions ENABLE ROW LEVEL SECURITY;

-- Helper: check admin/moderator role
CREATE OR REPLACE FUNCTION public.is_admin_or_moderator()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'moderator')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ==========================================
-- PROFILES
-- ==========================================
CREATE POLICY "Profiles are publicly readable"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ==========================================
-- VEHICLE MODELS (reference data)
-- ==========================================
CREATE POLICY "Vehicle models are publicly readable"
  ON public.vehicle_models FOR SELECT USING (true);

CREATE POLICY "Only admins can manage vehicle models"
  ON public.vehicle_models FOR ALL
  USING (public.is_admin_or_moderator());

-- ==========================================
-- CHARGING LOCATIONS
-- ==========================================
CREATE POLICY "Active locations are publicly readable"
  ON public.charging_locations FOR SELECT
  USING (status = 'active' OR added_by = auth.uid() OR public.is_admin_or_moderator());

CREATE POLICY "Authenticated users can add locations"
  ON public.charging_locations FOR INSERT
  WITH CHECK (auth.uid() = added_by);

CREATE POLICY "Users can update own locations"
  ON public.charging_locations FOR UPDATE
  USING (auth.uid() = added_by OR public.is_admin_or_moderator());

CREATE POLICY "Only admins can delete locations"
  ON public.charging_locations FOR DELETE
  USING (public.is_admin_or_moderator());

-- ==========================================
-- CONNECTOR TYPES (reference data)
-- ==========================================
CREATE POLICY "Connector types are publicly readable"
  ON public.connector_types FOR SELECT USING (true);

CREATE POLICY "Only admins can manage connector types"
  ON public.connector_types FOR ALL
  USING (public.is_admin_or_moderator());

-- ==========================================
-- LOCATION CONNECTORS
-- ==========================================
CREATE POLICY "Location connectors are publicly readable"
  ON public.location_connectors FOR SELECT USING (true);

CREATE POLICY "Location owner or admin can manage connectors"
  ON public.location_connectors FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.charging_locations
      WHERE id = location_id AND (added_by = auth.uid() OR public.is_admin_or_moderator())
    )
  );

CREATE POLICY "Location owner or admin can update connectors"
  ON public.location_connectors FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.charging_locations
      WHERE id = location_id AND (added_by = auth.uid() OR public.is_admin_or_moderator())
    )
  );

CREATE POLICY "Location owner or admin can delete connectors"
  ON public.location_connectors FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.charging_locations
      WHERE id = location_id AND (added_by = auth.uid() OR public.is_admin_or_moderator())
    )
  );

-- ==========================================
-- COMPATIBILITY REPORTS
-- ==========================================
CREATE POLICY "Reports are publicly readable"
  ON public.compatibility_reports FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add reports"
  ON public.compatibility_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ==========================================
-- REVIEWS
-- ==========================================
CREATE POLICY "Reviews are publicly readable"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews or admin"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin_or_moderator());

-- ==========================================
-- PHOTOS
-- ==========================================
CREATE POLICY "Photos are publicly readable"
  ON public.photos FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload photos"
  ON public.photos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos or admin"
  ON public.photos FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin_or_moderator());

-- ==========================================
-- AMENITIES (reference data)
-- ==========================================
CREATE POLICY "Amenities are publicly readable"
  ON public.amenities FOR SELECT USING (true);

CREATE POLICY "Only admins can manage amenities"
  ON public.amenities FOR ALL
  USING (public.is_admin_or_moderator());

-- ==========================================
-- LOCATION AMENITIES
-- ==========================================
CREATE POLICY "Location amenities are publicly readable"
  ON public.location_amenities FOR SELECT USING (true);

CREATE POLICY "Location owner or admin can manage location amenities"
  ON public.location_amenities FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.charging_locations
      WHERE id = location_id AND (added_by = auth.uid() OR public.is_admin_or_moderator())
    )
  );

CREATE POLICY "Location owner or admin can delete location amenities"
  ON public.location_amenities FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.charging_locations
      WHERE id = location_id AND (added_by = auth.uid() OR public.is_admin_or_moderator())
    )
  );

-- ==========================================
-- FAVORITES (private to user)
-- ==========================================
CREATE POLICY "Users can view own favorites"
  ON public.favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add own favorites"
  ON public.favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove own favorites"
  ON public.favorites FOR DELETE
  USING (auth.uid() = user_id);

-- ==========================================
-- VERIFICATION LOGS
-- ==========================================
CREATE POLICY "Verification logs are publicly readable"
  ON public.verification_logs FOR SELECT USING (true);

CREATE POLICY "Only moderators can create verification logs"
  ON public.verification_logs FOR INSERT
  WITH CHECK (public.is_admin_or_moderator());

-- ==========================================
-- EDIT SUGGESTIONS
-- ==========================================
CREATE POLICY "Users can view own suggestions or admins all"
  ON public.edit_suggestions FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin_or_moderator());

CREATE POLICY "Authenticated users can create suggestions"
  ON public.edit_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update suggestion status"
  ON public.edit_suggestions FOR UPDATE
  USING (public.is_admin_or_moderator());
