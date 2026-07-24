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
