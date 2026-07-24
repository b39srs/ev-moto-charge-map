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
