-- Drop the existing insert policy that requires user_id
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;

-- Create new policy that allows anyone to create orders (for guest checkout)
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
WITH CHECK (true);

-- Keep the existing select policies but add one for guests to see their order by ID
-- This will be handled by the application layer (they get the order ID after placing)