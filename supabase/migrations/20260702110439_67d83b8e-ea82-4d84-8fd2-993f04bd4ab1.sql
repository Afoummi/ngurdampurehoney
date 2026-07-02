
-- 1. Remove hardcoded moderator email from handle_new_user trigger.
-- Only bootstrap the two admins by email; everyone else defaults to customer.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  assigned_role public.app_role;
  email_lower TEXT := lower(NEW.email);
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');

  IF email_lower IN ('yayabashiru2001@gmail.com', 'binhafizgraphics@gmail.com') THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'customer';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- 2. site_media table: admin-managed images for hero slides, blog posts, banners, gallery.
CREATE TABLE IF NOT EXISTS public.site_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot TEXT NOT NULL, -- 'hero_slide' | 'blog_featured' | 'banner' | 'gallery' | 'trust' | 'about'
  title TEXT,
  subtitle TEXT,
  caption TEXT,
  link_url TEXT,
  image_url TEXT NOT NULL, -- may be storage path OR full URL
  storage_path TEXT,        -- object path in product-images bucket, if uploaded
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS site_media_slot_active_sort_idx
  ON public.site_media (slot, is_active, sort_order);

GRANT SELECT ON public.site_media TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_media TO authenticated;
GRANT ALL ON public.site_media TO service_role;

ALTER TABLE public.site_media ENABLE ROW LEVEL SECURITY;

-- Public read of active media only
CREATE POLICY "Public can read active site media"
ON public.site_media FOR SELECT
USING (is_active = true);

-- Admin/Moderator can read everything (incl. inactive)
CREATE POLICY "Staff can read all site media"
ON public.site_media FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Admin/Moderator can insert / update
CREATE POLICY "Staff can insert site media"
ON public.site_media FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Staff can update site media"
ON public.site_media FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Only admin can delete
CREATE POLICY "Admin can delete site media"
ON public.site_media FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger
CREATE TRIGGER update_site_media_updated_at
BEFORE UPDATE ON public.site_media
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Storage policies for the private product-images bucket to also host site media.
-- Public can SELECT (view) any object; only admins/moderators can write; only admins delete.
DO $$
BEGIN
  -- Drop legacy policies if they exist to keep this migration idempotent-ish
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public can view product images') THEN
    DROP POLICY "Public can view product images" ON storage.objects;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Staff can upload product images') THEN
    DROP POLICY "Staff can upload product images" ON storage.objects;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Staff can update product images') THEN
    DROP POLICY "Staff can update product images" ON storage.objects;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admin can delete product images') THEN
    DROP POLICY "Admin can delete product images" ON storage.objects;
  END IF;
END$$;

CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Staff can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
);

CREATE POLICY "Staff can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
);

CREATE POLICY "Admin can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND public.has_role(auth.uid(), 'admin')
);
