-- =============================================================
-- Networks (Charging Brands) + Map Filter Support
-- =============================================================

-- 1. Networks reference table
CREATE TABLE public.networks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Seed networks
INSERT INTO public.networks (name, display_name) VALUES
  ('gogoro', 'Gogoro'),
  ('swap_and_go', 'Swap & Go (PTT)'),
  ('ea_anywhere', 'EA Anywhere'),
  ('evolt', 'EVOLT'),
  ('winnonie', 'Winnonie'),
  ('h_sem', 'H SEM'),
  ('etran', 'ETRAN'),
  ('deco', 'Deco'),
  ('ev_station_pluz', 'EV Station PluZ'),
  ('niu', 'NIU'),
  ('strom', 'STROM'),
  ('sharge', 'SHARGE'),
  ('hmc', 'HMC');

-- 3. Add network FK to charging_locations
ALTER TABLE public.charging_locations
  ADD COLUMN network_id UUID REFERENCES public.networks(id) ON DELETE SET NULL;

CREATE INDEX idx_charging_locations_network ON public.charging_locations(network_id);

-- 4. Backfill network_id from station names
UPDATE public.charging_locations SET network_id = (SELECT id FROM public.networks WHERE name = 'gogoro') WHERE name LIKE 'Gogoro%';
UPDATE public.charging_locations SET network_id = (SELECT id FROM public.networks WHERE name = 'swap_and_go') WHERE name LIKE 'Swap & Go%';
UPDATE public.charging_locations SET network_id = (SELECT id FROM public.networks WHERE name = 'ea_anywhere') WHERE name LIKE 'EA Anywhere%';
UPDATE public.charging_locations SET network_id = (SELECT id FROM public.networks WHERE name = 'evolt') WHERE name LIKE 'EVOLT%';
UPDATE public.charging_locations SET network_id = (SELECT id FROM public.networks WHERE name = 'winnonie') WHERE name LIKE 'Winnonie%';
UPDATE public.charging_locations SET network_id = (SELECT id FROM public.networks WHERE name = 'h_sem') WHERE name LIKE 'H SEM%';
UPDATE public.charging_locations SET network_id = (SELECT id FROM public.networks WHERE name = 'etran') WHERE name LIKE 'ETRAN%';
UPDATE public.charging_locations SET network_id = (SELECT id FROM public.networks WHERE name = 'deco') WHERE name LIKE 'Deco%';
UPDATE public.charging_locations SET network_id = (SELECT id FROM public.networks WHERE name = 'ev_station_pluz') WHERE name LIKE 'EV Station PluZ%';
UPDATE public.charging_locations SET network_id = (SELECT id FROM public.networks WHERE name = 'niu') WHERE name LIKE 'NIU%';
UPDATE public.charging_locations SET network_id = (SELECT id FROM public.networks WHERE name = 'strom') WHERE name LIKE 'STROM%';
UPDATE public.charging_locations SET network_id = (SELECT id FROM public.networks WHERE name = 'sharge') WHERE name LIKE 'SHARGE%';
UPDATE public.charging_locations SET network_id = (SELECT id FROM public.networks WHERE name = 'hmc') WHERE name LIKE 'HMC E-bike%';

-- 5. Update station_map_pins view to include network_id
CREATE OR REPLACE VIEW public.station_map_pins AS
SELECT
  id,
  name,
  status,
  is_free,
  province,
  avg_rating,
  review_count,
  network_id,
  ST_Y(location::geometry) AS latitude,
  ST_X(location::geometry) AS longitude
FROM public.charging_locations;

-- 6. Grants
GRANT SELECT ON public.networks TO anon, authenticated;
GRANT SELECT ON public.station_map_pins TO anon, authenticated;
