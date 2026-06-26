DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe"
ON public.newsletter_subscribers
FOR INSERT
TO anon, authenticated
WITH CHECK (email IS NOT NULL AND length(email) BETWEEN 5 AND 320 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');