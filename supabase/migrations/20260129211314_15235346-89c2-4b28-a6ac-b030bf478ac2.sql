-- Create promo_banners table
CREATE TABLE public.promo_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  discount_text TEXT,
  promo_code TEXT,
  link_url TEXT DEFAULT '/products',
  link_text TEXT DEFAULT 'Shop Now',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_banners ENABLE ROW LEVEL SECURITY;

-- Public can view active banners
CREATE POLICY "Anyone can view active banners"
ON public.promo_banners
FOR SELECT
USING (is_active = true);

-- Admins can manage all banners
CREATE POLICY "Admins can manage banners"
ON public.promo_banners
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default banner
INSERT INTO public.promo_banners (title, discount_text, promo_code, link_url, link_text, is_active)
VALUES ('Limited Time Offer:', '20% OFF your first order!', 'HONEY20', '/products', 'Shop Now', true);