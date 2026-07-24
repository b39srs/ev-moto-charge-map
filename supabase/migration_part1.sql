-- ==========================================
-- PART 1: Extensions, Profiles, Vehicles, Locations, Connectors
-- ==========================================

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
