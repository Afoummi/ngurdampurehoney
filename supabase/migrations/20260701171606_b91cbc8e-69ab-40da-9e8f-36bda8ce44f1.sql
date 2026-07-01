
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
  ELSIF email_lower IN ('afoummi2001@gmail.com', 'moderator@ngurdam.com') THEN
    assigned_role := 'moderator';
  ELSE
    assigned_role := 'customer';
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;
