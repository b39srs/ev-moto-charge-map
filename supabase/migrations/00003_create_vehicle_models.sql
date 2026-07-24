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
