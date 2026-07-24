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
