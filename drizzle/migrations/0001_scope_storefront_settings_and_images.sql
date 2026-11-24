DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;

CREATE POLICY "Storefront can read referenced product images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'product-images'
  AND (
    EXISTS (
      SELECT 1
      FROM public.products AS p
      WHERE p.is_active = true
        AND (
          p.image_url = storage.objects.name
          OR position('/storage/v1/object/public/product-images/' || storage.objects.name IN p.image_url) > 0
          OR position('/storage/v1/object/authenticated/product-images/' || storage.objects.name IN p.image_url) > 0
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.site_media AS m
      WHERE m.is_active = true
        AND (
          m.storage_path = storage.objects.name
          OR m.image_url = storage.objects.name
          OR position('/storage/v1/object/public/product-images/' || storage.objects.name IN m.image_url) > 0
          OR position('/storage/v1/object/authenticated/product-images/' || storage.objects.name IN m.image_url) > 0
        )
    )
  )
);

CREATE POLICY "Staff can view all product images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'moderator'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Site settings readable by everyone" ON public.site_settings;

CREATE POLICY "Public can read storefront settings"
ON public.site_settings
FOR SELECT
TO anon, authenticated
USING (key IN ('business', 'social', 'footer'));