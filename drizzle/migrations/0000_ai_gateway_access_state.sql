CREATE TABLE public.ai_gateway_access_state (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  paused boolean NOT NULL DEFAULT false,
  status_code integer,
  safe_message text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.ai_gateway_access_state TO service_role;
ALTER TABLE public.ai_gateway_access_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages AI gateway access state"
ON public.ai_gateway_access_state
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);