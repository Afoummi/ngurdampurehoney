import { Link } from "react-router-dom";
import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
    const fetchBanner = async () => {
      try {
        const { data, error } = await supabase
          .from('promo_banners')
          .select('*')
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        setBanner(data);
      } catch (error) {
        console.error('Error fetching banner:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanner();
  }, []);

  if (isLoading || !banner || !isVisible) return null;

  return (
    <div className="relative bg-honey-gradient text-primary-foreground">
      <div className="container py-3">
        <div className="flex items-center justify-center gap-4 text-sm md:text-base">
          <span className="animate-pulse">🍯</span>
          <p className="font-medium">
            <span className="hidden sm:inline">{banner.title} </span>
            <span className="font-bold">{banner.discount_text}</span>
            {banner.promo_code && (
              <> Use code <span className="font-mono bg-white/20 px-2 py-0.5 rounded">{banner.promo_code}</span></>
            )}
          </p>
          {banner.link_url && banner.link_text && (
            <Button
              asChild
              size="sm"
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-primary-foreground border-0"
            >
              <Link to={banner.link_url}>{banner.link_text}</Link>
            </Button>
          )}
        </div>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
