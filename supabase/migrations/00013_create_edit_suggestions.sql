-- Edit suggestions
CREATE TYPE suggestion_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE public.edit_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  location_id UUID NOT NULL REFERENCES public.charging_locations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  current_value TEXT,
  suggested_value TEXT NOT NULL,
  reason TEXT,
  status suggestion_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_edit_suggestions_location ON public.edit_suggestions(location_id);
CREATE INDEX idx_edit_suggestions_status ON public.edit_suggestions(status);
CREATE INDEX idx_edit_suggestions_user ON public.edit_suggestions(user_id);
