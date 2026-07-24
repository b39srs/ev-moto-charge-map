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
