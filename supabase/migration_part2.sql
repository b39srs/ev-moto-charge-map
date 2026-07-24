-- ==========================================
-- PART 2: Reports, Reviews, Photos, Amenities, Favorites, Logs, Suggestions
-- ==========================================

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
