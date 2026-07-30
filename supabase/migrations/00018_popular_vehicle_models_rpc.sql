-- ============================================================
-- RPC: Get popular vehicle models by user adoption count
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_popular_vehicle_models(result_limit INTEGER DEFAULT 6)
RETURNS TABLE(id UUID) AS $$
BEGIN
  RETURN QUERY
    SELECT vm.id
    FROM public.vehicle_models vm
    INNER JOIN public.profiles p ON p.ev_model_id = vm.id
    WHERE vm.is_active = true
    GROUP BY vm.id
    ORDER BY COUNT(p.id) DESC
    LIMIT result_limit;
END;
$$ LANGUAGE plpgsql STABLE;

GRANT EXECUTE ON FUNCTION public.get_popular_vehicle_models TO anon, authenticated;
