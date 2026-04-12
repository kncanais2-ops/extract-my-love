
-- Table to store the first device token per user
CREATE TABLE public.user_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  device_token TEXT NOT NULL,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_devices ENABLE ROW LEVEL SECURITY;

-- Users can read their own device record
CREATE POLICY "Users can view own device"
ON public.user_devices
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own device record (first login only)
CREATE POLICY "Users can register device"
ON public.user_devices
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Function to check device and block if mismatch (security definer to bypass RLS for update)
CREATE OR REPLACE FUNCTION public.check_device(p_device_token TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record user_devices%ROWTYPE;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  
  SELECT * INTO v_record FROM user_devices WHERE user_id = v_user_id;
  
  -- No record yet: first login, register device
  IF NOT FOUND THEN
    INSERT INTO user_devices (user_id, device_token) VALUES (v_user_id, p_device_token);
    RETURN jsonb_build_object('status', 'ok', 'first_login', true);
  END IF;
  
  -- Already blocked
  IF v_record.is_blocked THEN
    RETURN jsonb_build_object('status', 'blocked');
  END IF;
  
  -- Device mismatch: block the account
  IF v_record.device_token != p_device_token THEN
    UPDATE user_devices SET is_blocked = true WHERE user_id = v_user_id;
    RETURN jsonb_build_object('status', 'blocked');
  END IF;
  
  -- Same device, all good
  RETURN jsonb_build_object('status', 'ok', 'first_login', false);
END;
$$;
