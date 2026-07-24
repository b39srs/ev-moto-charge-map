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
