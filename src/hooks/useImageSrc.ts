import { useEffect, useState } from "react";
import { resolveImageSrc } from "@/lib/imageUrl";

/**
 * Resolve a stored image reference (public storage URL, bare storage path,
 * or external URL) to a renderable URL — signed for the private
 * `product-images` bucket, unchanged for external/bundled assets.
 *
 * Returns the original value immediately and swaps in the signed URL once
 * resolved, so there is no layout flash.
 */
export function useImageSrc(value: string | null | undefined, fallback?: string): string {
  const [src, setSrc] = useState<string>(() => value || fallback || "");

  useEffect(() => {
    let cancelled = false;
    setSrc(value || fallback || "");
    if (!value) return;
    resolveImageSrc(value).then((resolved) => {
      if (!cancelled && resolved) setSrc(resolved);
    });
    return () => {
      cancelled = true;
    };
  }, [value, fallback]);

  return src;
}
