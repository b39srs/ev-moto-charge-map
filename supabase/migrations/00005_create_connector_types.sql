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
