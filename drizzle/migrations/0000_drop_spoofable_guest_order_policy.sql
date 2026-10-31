DROP POLICY IF EXISTS "Guests can view orders by access token" ON public.orders;

COMMENT ON POLICY "Users can view their own orders" ON public.orders IS 'Guest order viewing is handled server-side by the get-order edge function (service role + token check), not by RLS headers.';