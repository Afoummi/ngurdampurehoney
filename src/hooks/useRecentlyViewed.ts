import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/lib/products";

const KEY = "ngurdam.recently_viewed";
const MAX = 8;

function readIds(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function trackRecentlyViewed(productId: string) {
  if (typeof window === "undefined") return;
  const ids = readIds().filter((id) => id !== productId);
  ids.unshift(productId);
  localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX)));
}

export function useRecentlyViewed(excludeId?: string, limit = 4) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const ids = readIds().filter((id) => id !== excludeId);
    if (ids.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("products")
      .select("*")
      .in("id", ids)
      .eq("is_active", true);
    const map = new Map((data ?? []).map((p) => [p.id, p as Product]));
    const ordered = ids.map((id) => map.get(id)).filter(Boolean) as Product[];
    setProducts(ordered.slice(0, limit));
    setLoading(false);
  }, [excludeId, limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { products, loading, refresh };
}
