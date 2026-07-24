-- View for lightweight map pin data
CREATE OR REPLACE VIEW public.station_map_pins AS
SELECT
  id,
  name,
  status,
  is_free,
  province,
  avg_rating,
  review_count,
  ST_Y(location::geometry) AS latitude,
  ST_X(location::geometry) AS longitude
FROM public.charging_locations;

-- Function to get coordinates for a single station
CREATE OR REPLACE FUNCTION public.get_station_coordinates(station_id UUID)
RETURNS TABLE(latitude DOUBLE PRECISION, longitude DOUBLE PRECISION)
LANGUAGE sql STABLE
AS $$
  SELECT
    ST_Y(location::geometry) AS latitude,
    ST_X(location::geometry) AS longitude
  FROM public.charging_locations
  WHERE id = station_id;
$$;
