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
