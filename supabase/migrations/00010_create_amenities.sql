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
