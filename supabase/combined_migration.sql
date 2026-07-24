-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
-- User profiles (linked to Supabase Auth)
CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user',
  bio TEXT,
  ev_model_id UUID,
  reputation_score INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
-- Vehicle models
CREATE TYPE vehicle_category AS ENUM ('motorcycle', 'scooter', 'moped');

CREATE TABLE public.vehicle_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  category vehicle_category NOT NULL DEFAULT 'motorcycle',
  year_start INTEGER,
  year_end INTEGER,
  battery_kwh DECIMAL(5,2),
  connector_type_id UUID,
  max_charge_kw DECIMAL(5,2),
  range_km INTEGER,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_vehicle_models_brand_model ON public.vehicle_models(brand, model);

-- Add FK from profiles to vehicle_models
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profiles_ev_model
  FOREIGN KEY (ev_model_id) REFERENCES public.vehicle_models(id) ON DELETE SET NULL;

CREATE TRIGGER vehicle_models_updated_at
  BEFORE UPDATE ON public.vehicle_models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
-- Charging locations
CREATE TYPE location_status AS ENUM ('active', 'inactive', 'under_construction', 'permanently_closed', 'pending_verification');
CREATE TYPE location_source AS ENUM ('community', 'official', 'imported');

CREATE TABLE public.charging_locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  province TEXT NOT NULL,
  district TEXT,
  subdistrict TEXT,
  postal_code TEXT,
  location GEOGRAPHY(Point, 4326) NOT NULL,

  status location_status NOT NULL DEFAULT 'pending_verification',
  source location_source NOT NULL DEFAULT 'community',
  is_free BOOLEAN NOT NULL DEFAULT false,
  price_description TEXT,
  operating_hours TEXT,
  contact_phone TEXT,
  website_url TEXT,

  added_by UUID NOT NULL REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES public.profiles(id),
  avg_rating DECIMAL(2,1) DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  photo_count INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Spatial index for proximity queries
CREATE INDEX idx_charging_locations_geo ON public.charging_locations USING GIST (location);
CREATE INDEX idx_charging_locations_status ON public.charging_locations(status);
CREATE INDEX idx_charging_locations_province ON public.charging_locations(province);
CREATE INDEX idx_charging_locations_name_trgm ON public.charging_locations USING GIN (name gin_trgm_ops);

CREATE TRIGGER charging_locations_updated_at
  BEFORE UPDATE ON public.charging_locations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
-- Connector types
CREATE TABLE public.connector_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  power_type TEXT NOT NULL,
  is_common_for_motorcycle BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add FK from vehicle_models
ALTER TABLE public.vehicle_models
  ADD CONSTRAINT fk_vehicle_models_connector
  FOREIGN KEY (connector_type_id) REFERENCES public.connector_types(id) ON DELETE SET NULL;
-- Location connectors (junction table)
CREATE TABLE public.location_connectors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES public.charging_locations(id) ON DELETE CASCADE,
  connector_type_id UUID NOT NULL REFERENCES public.connector_types(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  power_kw DECIMAL(6,2),
  price_per_kwh DECIMAL(6,2),
  price_per_minute DECIMAL(6,2),
  is_available BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_location_connectors_location ON public.location_connectors(location_id);
CREATE INDEX idx_location_connectors_type ON public.location_connectors(connector_type_id);
CREATE UNIQUE INDEX idx_location_connector_unique ON public.location_connectors(location_id, connector_type_id);

CREATE TRIGGER location_connectors_updated_at
  BEFORE UPDATE ON public.location_connectors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
-- Compatibility reports
CREATE TYPE compatibility_status AS ENUM ('compatible', 'incompatible', 'partial', 'untested');
CREATE TYPE charge_result AS ENUM ('success', 'slow_charge', 'failed', 'adapter_needed');

CREATE TABLE public.compatibility_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES public.charging_locations(id) ON DELETE CASCADE,
  vehicle_model_id UUID NOT NULL REFERENCES public.vehicle_models(id) ON DELETE CASCADE,
  connector_id UUID REFERENCES public.location_connectors(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  status compatibility_status NOT NULL,
  result charge_result NOT NULL,
  charge_speed_kw DECIMAL(5,2),
  charge_duration_minutes INTEGER,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_compat_reports_location ON public.compatibility_reports(location_id);
CREATE INDEX idx_compat_reports_vehicle ON public.compatibility_reports(vehicle_model_id);
CREATE INDEX idx_compat_reports_user ON public.compatibility_reports(user_id);
-- Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES public.charging_locations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  visit_date DATE,
  is_edited BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_reviews_user_location ON public.reviews(user_id, location_id);
CREATE INDEX idx_reviews_location ON public.reviews(location_id);

-- Trigger to update avg_rating and review_count on charging_locations
CREATE OR REPLACE FUNCTION public.update_location_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.charging_locations
    SET avg_rating = COALESCE((SELECT AVG(rating)::DECIMAL(2,1) FROM public.reviews WHERE location_id = OLD.location_id), 0),
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE location_id = OLD.location_id)
    WHERE id = OLD.location_id;
    RETURN OLD;
  ELSE
    UPDATE public.charging_locations
    SET avg_rating = COALESCE((SELECT AVG(rating)::DECIMAL(2,1) FROM public.reviews WHERE location_id = NEW.location_id), 0),
        review_count = (SELECT COUNT(*) FROM public.reviews WHERE location_id = NEW.location_id)
    WHERE id = NEW.location_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_review_stats
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_location_review_stats();

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
-- Photos
CREATE TYPE photo_category AS ENUM ('station', 'connector', 'environment', 'parking', 'other');

CREATE TABLE public.photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES public.charging_locations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  category photo_category NOT NULL DEFAULT 'station',
  is_primary BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_photos_location ON public.photos(location_id);

-- Trigger to update photo_count on charging_locations
CREATE OR REPLACE FUNCTION public.update_location_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.charging_locations
    SET photo_count = (SELECT COUNT(*) FROM public.photos WHERE location_id = OLD.location_id)
    WHERE id = OLD.location_id;
    RETURN OLD;
  ELSE
    UPDATE public.charging_locations
    SET photo_count = (SELECT COUNT(*) FROM public.photos WHERE location_id = NEW.location_id)
    WHERE id = NEW.location_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER update_photo_count
  AFTER INSERT OR DELETE ON public.photos
  FOR EACH ROW EXECUTE FUNCTION public.update_location_photo_count();
-- Amenities
CREATE TABLE public.amenities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Junction table: location <-> amenity
CREATE TABLE public.location_amenities (
  location_id UUID NOT NULL REFERENCES public.charging_locations(id) ON DELETE CASCADE,
  amenity_id UUID NOT NULL REFERENCES public.amenities(id) ON DELETE CASCADE,
  PRIMARY KEY (location_id, amenity_id)
);

CREATE INDEX idx_location_amenities_location ON public.location_amenities(location_id);
-- Favorites
CREATE TABLE public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  location_id UUID NOT NULL REFERENCES public.charging_locations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_favorites_user_location ON public.favorites(user_id, location_id);
CREATE INDEX idx_favorites_user ON public.favorites(user_id);
-- Verification logs
CREATE TYPE verification_action AS ENUM ('verify', 'reject', 'flag', 'unflag');

CREATE TABLE public.verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES public.charging_locations(id) ON DELETE CASCADE,
  moderator_id UUID NOT NULL REFERENCES public.profiles(id),
  action verification_action NOT NULL,
  reason TEXT,
  previous_status location_status,
  new_status location_status,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_verification_logs_location ON public.verification_logs(location_id);
CREATE INDEX idx_verification_logs_moderator ON public.verification_logs(moderator_id);
-- Edit suggestions
CREATE TYPE suggestion_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.edit_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES public.charging_locations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  current_value TEXT,
  suggested_value TEXT NOT NULL,
  reason TEXT,
  status suggestion_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_edit_suggestions_location ON public.edit_suggestions(location_id);
CREATE INDEX idx_edit_suggestions_status ON public.edit_suggestions(status);
CREATE INDEX idx_edit_suggestions_user ON public.edit_suggestions(user_id);
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
-- Connector types common in Thailand for EV motorcycles
INSERT INTO public.connector_types (name, display_name, description, power_type, is_common_for_motorcycle) VALUES
  ('Type 1 (J1772)', 'ไทป์ 1 (J1772)', 'มาตรฐานอเมริกัน/ญี่ปุ่น AC', 'AC', false),
  ('Type 2 (Mennekes)', 'ไทป์ 2 (Mennekes)', 'มาตรฐานยุโรป AC', 'AC', false),
  ('CCS1', 'CCS1', 'Combined Charging System แบบ 1', 'DC', false),
  ('CCS2', 'CCS2', 'Combined Charging System แบบ 2', 'DC', false),
  ('CHAdeMO', 'ชาเดโม', 'มาตรฐานญี่ปุ่น DC', 'DC', false),
  ('GB/T', 'GB/T', 'มาตรฐานจีน', 'DC', false),
  ('Household Plug', 'ปลั๊กบ้าน', 'เต้าเสียบมาตรฐานไทย 220V', 'AC', true),
  ('Portable Charger', 'ที่ชาร์จพกพา', 'ที่ชาร์จพกพาจากผู้ผลิต', 'AC', true),
  ('Proprietary', 'เฉพาะรุ่น', 'หัวชาร์จเฉพาะของผู้ผลิต', 'AC', true);

-- Common amenities
INSERT INTO public.amenities (name, display_name, icon, category) VALUES
  ('parking', 'ที่จอดรถ', 'circle-parking', 'facility'),
  ('restroom', 'ห้องน้ำ', 'bath', 'facility'),
  ('wifi', 'Wi-Fi', 'wifi', 'facility'),
  ('food', 'ร้านอาหาร', 'utensils', 'nearby'),
  ('coffee', 'ร้านกาแฟ', 'coffee', 'nearby'),
  ('convenience_store', 'ร้านสะดวกซื้อ', 'store', 'nearby'),
  ('covered', 'มีหลังคา', 'umbrella', 'feature'),
  ('24hours', 'เปิด 24 ชม.', 'clock', 'feature'),
  ('security', 'มีรปภ.', 'shield-check', 'safety'),
  ('lighting', 'มีไฟส่องสว่าง', 'lightbulb', 'safety'),
  ('motorcycle_parking', 'ที่จอดมอเตอร์ไซค์', 'bike', 'facility'),
  ('shopping', 'ห้างสรรพสินค้า', 'shopping-cart', 'nearby');
