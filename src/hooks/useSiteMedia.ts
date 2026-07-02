import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SiteMediaSlot =
  | "hero_slide"
  | "blog_featured"
  | "banner"
  | "gallery"
  | "trust"
  | "about";

export interface SiteMediaEntry {
  id: string;
  slot: SiteMediaSlot | string;
  title: string | null;
  subtitle: string | null;
  caption: string | null;
  link_url: string | null;
  image_url: string;
  storage_path: string | null;
  sort_order: number;
  is_active: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch admin-managed site media for a given slot.
 * Falls back to an empty array when nothing has been uploaded yet —
 * pages should provide their own placeholder in that case.
 */
export function useSiteMedia(slot: SiteMediaSlot, options?: { includeInactive?: boolean }) {
  const [entries, setEntries] = useState<SiteMediaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let query = supabase
        .from("site_media" as never)
        .select("*")
        .eq("slot", slot)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (!options?.includeInactive) {
        query = query.eq("is_active", true);
      }

      const { data, error } = await query;
      if (cancelled) return;
      if (error) {
        setError(error as unknown as Error);
        setEntries([]);
      } else {
        setEntries((data as unknown as SiteMediaEntry[]) ?? []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slot, options?.includeInactive]);

  return { entries, loading, error };
}

/**
 * Get the public URL for an object in the product-images bucket.
 * If value is already an absolute URL, return it as-is.
 */
export function resolveMediaUrl(value: string | null | undefined): string {
  if (!value) return "";
  if (value.startsWith("http") || value.startsWith("/")) return value;
  const { data } = supabase.storage.from("product-images").getPublicUrl(value);
  return data.publicUrl;
}
