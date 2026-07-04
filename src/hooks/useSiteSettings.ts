import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BRAND, FORMATTED_ADDRESS } from "@/lib/brand";

export interface BusinessSettings {
  legal_name: string;
  product_name: string;
  tagline: string;
  email: string;
  phones: string[];
  whatsapp: string;
  address_line1: string;
  address_line2: string;
  address_line3: string;
  origin: string;
  nafdac_number: string;
  hours: { day: string; hours: string }[];
  map_embed_url: string;
}

export interface SocialSettings {
  facebook: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  whatsapp: string;
}

export interface FooterSettings {
  about: string;
}

const DEFAULT_BUSINESS: BusinessSettings = {
  legal_name: BRAND.legalName,
  product_name: BRAND.productName,
  tagline: BRAND.tagline,
  email: BRAND.email,
  phones: [...BRAND.phones],
  whatsapp: BRAND.whatsappNumber,
  address_line1: BRAND.address.line1,
  address_line2: BRAND.address.line2,
  address_line3: BRAND.address.line3,
  origin: BRAND.origin.full,
  nafdac_number: BRAND.nafdacNumber,
  hours: [
    { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM" },
    { day: "Saturday", hours: "10:00 AM – 4:00 PM" },
    { day: "Sunday", hours: "Closed" },
  ],
  map_embed_url: "",
};

const DEFAULT_SOCIAL: SocialSettings = {
  facebook: BRAND.social.facebook,
  instagram: "#",
  twitter: "#",
  tiktok: "#",
  whatsapp: `https://wa.me/${BRAND.whatsappNumber}`,
};

const DEFAULT_FOOTER: FooterSettings = {
  about: `Premium 100% pure, unprocessed honey from Nigerian apiaries. ${BRAND.tagline}`,
};

export interface SiteSettings {
  business: BusinessSettings;
  social: SocialSettings;
  footer: FooterSettings;
  formattedAddress: string;
}

function mergeBusiness(v: any): BusinessSettings {
  return { ...DEFAULT_BUSINESS, ...(v || {}) };
}
function mergeSocial(v: any): SocialSettings {
  return { ...DEFAULT_SOCIAL, ...(v || {}) };
}
function mergeFooter(v: any): FooterSettings {
  return { ...DEFAULT_FOOTER, ...(v || {}) };
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    business: DEFAULT_BUSINESS,
    social: DEFAULT_SOCIAL,
    footer: DEFAULT_FOOTER,
    formattedAddress: FORMATTED_ADDRESS,
  });
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("key, value");
    if (data) {
      const map: Record<string, any> = {};
      data.forEach((r: any) => (map[r.key] = r.value));
      const business = mergeBusiness(map.business);
      setSettings({
        business,
        social: mergeSocial(map.social),
        footer: mergeFooter(map.footer),
        formattedAddress: `${business.address_line1}, ${business.address_line2}, ${business.address_line3}.`,
      });
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { ...settings, isLoading, reload: load };
}
