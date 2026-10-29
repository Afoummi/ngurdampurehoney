import { supabase } from "@/integrations/supabase/client";

/**
 * Signed-URL resolution for the PRIVATE `product-images` storage bucket.
 *
 * The bucket is intentionally private (no public object access), so any URL
 * produced by getPublicUrl() or a bare storage path must be exchanged for a
 * short-lived signed URL before it can be rendered in an <img>.
 *
 * resolveImageSrc():
 *  - absolute external URLs (http/https), data:, blob: and root-relative
 *    paths (bundled assets like "/photos/x.jpg") are returned unchanged;
 *  - getPublicUrl()-style URLs pointing at the product-images bucket are
 *    converted back to their storage path and signed;
 *  - bare storage paths ("products/123-abc.jpg") are signed directly.
 *
 * Signed URLs are cached in memory and refreshed a few minutes before they
 * expire, so lists and slideshows do not re-sign on every render.
 */

const BUCKET = "product-images";
const SIGN_TTL_SECONDS = 3600; // 1 hour signed URL
const REFRESH_MARGIN_MS = 5 * 60 * 1000; // re-sign 5 min before expiry

const cache = new Map<string, { url: string; expiresAt: number }>();
const inflight = new Map<string, Promise<string>>();

const EXTERNAL_RE = /^(https?:|data:|blob:)/i;

/** Pull the storage path out of a value, or null when it is not a bucket object. */
export function extractStoragePath(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  // Public or authenticated storage URL -> path
  const marker = `/storage/v1/object/${"public"}/${BUCKET}/`;
  const markerAuth = `/storage/v1/object/authenticated/${BUCKET}/`;
  for (const m of [marker, markerAuth]) {
    const idx = trimmed.indexOf(m);
    if (idx !== -1) {
      const rest = trimmed.slice(idx + m.length).split("?")[0];
      try {
        return decodeURIComponent(rest) || null;
      } catch {
        return rest || null;
      }
    }
  }

  // External or bundled asset — not ours to sign
  if (EXTERNAL_RE.test(trimmed) || trimmed.startsWith("/")) return null;

  // Otherwise treat it as a bare storage path (e.g. "products/123.jpg")
  const path = trimmed.split("?")[0];
  return path.includes("/") || /\.[a-z0-9]{2,5}$/i.test(path) ? path : null;
}

/** Resolve any stored image reference to a renderable URL. */
export async function resolveImageSrc(value: string | null | undefined): Promise<string | null> {
  if (!value) return null;
  const path = extractStoragePath(value);
  if (!path) return value;

  const now = Date.now();
  const cached = cache.get(path);
  if (cached && cached.expiresAt > now + REFRESH_MARGIN_MS) return cached.url;

  const pending = inflight.get(path);
  if (pending) return pending;

  const task = (async () => {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, SIGN_TTL_SECONDS);
      if (error || !data?.signedUrl) {
        // Leave the stored value in place on failure (e.g. object deleted);
        // the browser will just show the fallback.
        return value;
      }
      cache.set(path, {
        url: data.signedUrl,
        expiresAt: now + SIGN_TTL_SECONDS * 1000,
      });
      return data.signedUrl;
    } finally {
      inflight.delete(path);
    }
  })();

  inflight.set(path, task);
  return task;
}

/** Drop a cached signed URL (e.g. after the underlying object was replaced/deleted). */
export function invalidateImageSrc(value: string | null | undefined) {
  const path = extractStoragePath(value);
  if (path) {
    cache.delete(path);
    inflight.delete(path);
  }
}
