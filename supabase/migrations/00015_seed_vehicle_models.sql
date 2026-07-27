-- =============================================================
-- Seed vehicle_models with popular EV motorcycles in Thailand
-- =============================================================

INSERT INTO public.vehicle_models (brand, model, category) VALUES
  ('i-Motor', 'Thunder', 'motorcycle'),
  ('EM', 'Milano', 'scooter'),
  ('Deco', 'Deco', 'scooter'),
  ('Strom', 'Strom', 'motorcycle'),
  ('NIU', 'NIU', 'scooter'),
  ('Honda', 'EM1 e:', 'scooter'),
  ('Honda', 'CUV e:', 'scooter'),
  ('Gogoro', 'Gogoro', 'scooter'),
  ('Yamaha', 'Neo''s', 'scooter'),
  ('Other', 'Other', 'motorcycle')
ON CONFLICT (brand, model) DO NOTHING;
