/**
 * Lightweight client-side sliding-window throttle.
 * This is a usability guardrail against accidental/naive abuse — the
 * authoritative limits live in the edge functions and Supabase auth.
 */
const STORE_PREFIX = "rl:";

interface Bucket {
  hits: number[];
}

function read(key: string): Bucket {
  try {
    const raw = localStorage.getItem(STORE_PREFIX + key);
    if (!raw) return { hits: [] };
    const parsed = JSON.parse(raw) as Bucket;
    return Array.isArray(parsed.hits) ? parsed : { hits: [] };
  } catch {
    return { hits: [] };
  }
}

function write(key: string, bucket: Bucket) {
  try {
    localStorage.setItem(STORE_PREFIX + key, JSON.stringify(bucket));
  } catch {
    /* storage unavailable — fail open */
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * @param key      unique action key, e.g. "newsletter" or "login"
 * @param limit    max attempts allowed inside the window
 * @param windowMs sliding window size in milliseconds
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = read(key);
  const hits = bucket.hits.filter((t) => now - t < windowMs);

  if (hits.length >= limit) {
    const oldest = Math.min(...hits);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000)),
    };
  }

  hits.push(now);
  write(key, { hits });
  return { allowed: true, retryAfterSeconds: 0 };
}

export function rateLimitMessage(seconds: number) {
  if (seconds < 60) return `Too many attempts. Please try again in ${seconds}s.`;
  const mins = Math.ceil(seconds / 60);
  return `Too many attempts. Please try again in ${mins} minute${mins > 1 ? "s" : ""}.`;
}
