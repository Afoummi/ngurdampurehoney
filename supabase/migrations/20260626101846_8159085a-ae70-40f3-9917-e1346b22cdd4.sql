
-- Fix critical: restrict order_items insert to service_role only
DROP POLICY IF EXISTS "Service role can insert order items" ON public.order_items;
CREATE POLICY "Service role can insert order items"
ON public.order_items
FOR INSERT
TO service_role
WITH CHECK (true);

-- Lock down SECURITY DEFINER functions from direct client execution
REVOKE EXECUTE ON FUNCTION public.make_user_admin(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
-- has_role is used by RLS policies (runs as definer in policy context); revoke direct calls too
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;

-- Guest order lookup: allow SELECT when access_token matches (used by /track-order page)
DROP POLICY IF EXISTS "Guests can view orders by access token" ON public.orders;
CREATE POLICY "Guests can view orders by access token"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (
  access_token IS NOT NULL
  AND access_token = current_setting('request.headers', true)::json->>'x-order-access-token'
);
