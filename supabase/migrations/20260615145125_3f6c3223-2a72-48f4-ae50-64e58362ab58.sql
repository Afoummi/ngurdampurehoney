
-- 1. Add size column to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size TEXT;

-- 2. Replace handle_new_user with email-based role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role public.app_role;
  email_lower TEXT := lower(NEW.email);
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');

  IF email_lower IN ('yayabashiru2001@gmail.com', 'binhafizgraphics@gmail.com') THEN
    assigned_role := 'admin';
  ELSIF email_lower = 'afoummi2001@gmail.com' THEN
    assigned_role := 'moderator';
  ELSE
    assigned_role := 'customer';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Remove duplicate customer role from super admin so single-row queries work
DELETE FROM public.user_roles
WHERE role = 'customer'
  AND user_id IN (SELECT user_id FROM public.user_roles WHERE role IN ('admin', 'moderator'));
