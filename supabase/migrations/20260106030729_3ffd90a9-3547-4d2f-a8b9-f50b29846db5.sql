-- 1. Add access_token column for guest order tracking
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS access_token TEXT UNIQUE;
CREATE INDEX IF NOT EXISTS idx_orders_access_token ON public.orders(access_token) WHERE access_token IS NOT NULL;

-- 2. Drop conflicting RLS policies
DROP POLICY IF EXISTS "Block anonymous access" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;

-- 3. Create secure RLS policies
-- Authenticated users can create orders linked to their account
CREATE POLICY "Authenticated users can create orders"
ON public.orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

-- Allow service role to insert orders (for edge function)
CREATE POLICY "Service role can create orders"
ON public.orders FOR INSERT
TO service_role
WITH CHECK (true);

-- Users can view their own orders OR orders with matching access_token via service_role
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Fix make_user_admin function - remove SECURITY DEFINER and add admin check
CREATE OR REPLACE FUNCTION public.make_user_admin(user_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Only existing admins can promote others
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can promote users to admin role';
  END IF;
  
  -- Get user id from auth.users by email
  SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', user_email;
  END IF;
  
  -- Insert admin role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;