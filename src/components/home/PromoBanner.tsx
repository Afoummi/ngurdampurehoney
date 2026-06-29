import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface BannerData {
  id: string;
  title: string;
  discount_text: string | null;
  promo_code: string | null;
  link_url: string | null;
  link_text: string | null;
}

export function PromoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("promo_banners")
      .select("*")
      .eq("is_active", true)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        setBanner(data);
        setIsLoading(false);
      });
  }, []);

  if (isLoading || !banner || !isVisible) return null;

  return (
    <div className="relative bg-primary text-primary-foreground">
      <div className="container py-2.5">
        <div className="flex items-center justify-center gap-3 text-xs md:text-sm pr-8">
          <span aria-hidden="true" className="text-honey">●</span>
          <p className="font-medium">
            <span className="hidden sm:inline opacity-80">{banner.title} </span>
            <span className="text-honey font-semibold">{banner.discount_text}</span>
            {banner.promo_code && (
              <> · use code <span className="font-mono bg-honey/20 text-honey px-2 py-0.5 rounded">{banner.promo_code}</span></>
            )}
          </p>
          {banner.link_url && banner.link_text && (
            <Link to={banner.link_url} className="underline underline-offset-4 hover:text-honey transition-colors hidden md:inline">
              {banner.link_text}
            </Link>
          )}
        </div>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-primary-foreground/10 rounded-full transition-colors"
        aria-label="Dismiss promotional banner"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
