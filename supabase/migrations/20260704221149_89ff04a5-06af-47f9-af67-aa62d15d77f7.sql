
-- 1. Products: low stock threshold
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 5;

-- 2. Site settings (singleton key/value store for business info, social, hours, footer)
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site settings readable by everyone"
  ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage site settings"
  ON public.site_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Testimonials
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_location TEXT,
  quote TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  avatar_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.testimonials TO anon, authenticated;
GRANT ALL ON public.testimonials TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published testimonials readable by everyone"
  ON public.testimonials FOR SELECT USING (is_published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Admins manage testimonials"
  ON public.testimonials FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE TRIGGER testimonials_updated_at BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. FAQs
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  is_published BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT ALL ON public.faqs TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published faqs readable by everyone"
  ON public.faqs FOR SELECT USING (is_published = true OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Admins manage faqs"
  ON public.faqs FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE TRIGGER faqs_updated_at BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Seed default site_settings + testimonials + faqs
INSERT INTO public.site_settings (key, value) VALUES
  ('business', '{
    "legal_name": "AB SARDAUNA NGURDAM VENTURES",
    "product_name": "Ngurdam Pure Honey",
    "tagline": "100% pure, unprocessed Nigerian honey.",
    "email": "info@ngurdamhoney.com",
    "phones": ["+234 803 000 0000", "+234 806 000 0000"],
    "whatsapp": "+2348030000000",
    "address_line1": "Arkilla Area, Behind Alkanci Plaza",
    "address_line2": "Sokoto",
    "address_line3": "Sokoto State, Nigeria",
    "origin": "Gembu, Sardauna LGA, Taraba State, Nigeria",
    "nafdac_number": "A8-121062L",
    "hours": [
      {"day": "Monday - Friday", "hours": "9:00 AM - 6:00 PM"},
      {"day": "Saturday", "hours": "10:00 AM - 4:00 PM"},
      {"day": "Sunday", "hours": "Closed"}
    ],
    "map_embed_url": ""
  }'::jsonb),
  ('social', '{
    "facebook": "https://facebook.com/ngurdamhoney",
    "instagram": "https://instagram.com/ngurdamhoney",
    "twitter": "https://twitter.com/ngurdamhoney",
    "tiktok": "https://tiktok.com/@ngurdamhoney",
    "whatsapp": "https://wa.me/2348030000000"
  }'::jsonb),
  ('footer', '{
    "about": "Premium 100% pure, unprocessed honey from the pristine highlands of Gembu, Sardauna LGA."
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.testimonials (author_name, author_location, quote, rating, sort_order) VALUES
  ('Aisha Bello', 'Abuja, FCT', 'The purest honey I have ever tasted. You can literally taste the wildflowers.', 5, 1),
  ('Chukwuemeka Okafor', 'Lagos', 'Ordered a 1L jar for my family — arrived beautifully packaged and the quality is unmatched.', 5, 2),
  ('Fatima Musa', 'Kano', 'I use Ngurdam honey every morning. Natural, unfiltered and clearly authentic.', 5, 3),
  ('David Adeyemi', 'Port Harcourt', 'Finally a Nigerian honey brand I can trust. NAFDAC registered and delivered on time.', 5, 4)
ON CONFLICT DO NOTHING;

INSERT INTO public.faqs (question, answer, category, sort_order) VALUES
  ('Is Ngurdam Honey 100% pure?', 'Yes. Every jar of Ngurdam Honey is 100% pure, unprocessed and unadulterated. We do not add sugar, water, glucose or preservatives.', 'quality', 1),
  ('Where is the honey sourced?', 'Our honey is sourced from the pristine highlands of Gembu, Sardauna Local Government Area, Taraba State, Nigeria — one of West Africa''s richest natural beekeeping regions.', 'quality', 2),
  ('Does natural honey crystallize?', 'Yes. Crystallization is a natural sign of pure, raw honey. To return it to a liquid state, warm the jar gently in warm (not hot) water. Never microwave raw honey.', 'quality', 3),
  ('How should I store my honey?', 'Store in a cool, dry place away from direct sunlight. There is no need to refrigerate. Pure honey never spoils when stored correctly.', 'quality', 4),
  ('How do I place an order?', 'Browse our products, add your favourites to the cart, and complete the short checkout form. You will then be redirected to WhatsApp to confirm and pay.', 'orders', 5),
  ('How long does delivery take?', 'Typically 2–5 business days within Nigeria, depending on your location. You will receive updates via WhatsApp throughout the process.', 'orders', 6),
  ('What payment methods are accepted?', 'We accept bank transfer, POS on delivery (in select areas) and mobile transfers. Payment details are shared securely on WhatsApp after your order.', 'orders', 7),
  ('How do I contact customer support?', 'Reach us any time on WhatsApp, by phone, or by email using the details on our Contact page. We respond within business hours.', 'support', 8)
ON CONFLICT DO NOTHING;
