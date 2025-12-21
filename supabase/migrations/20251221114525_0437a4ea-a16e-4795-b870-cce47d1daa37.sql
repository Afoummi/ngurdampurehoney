-- Add policy to explicitly block anonymous access to orders table
CREATE POLICY "Block anonymous access"
ON public.orders
FOR ALL
USING (auth.uid() IS NOT NULL);