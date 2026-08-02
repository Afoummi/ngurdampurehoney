export const ALLOWED_IMAGE_MIME = ["image/jpeg", "image/png", "image/webp"] as const;
export const ALLOWED_IMAGE_EXT = ["jpg", "jpeg", "png", "webp"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export type UploadCheck = ValidatedUpload | FailedUpload;

export interface ValidatedUpload {
  ok: true;
  error?: undefined;
  /** Safe, random, extension-normalised object path */
  path: string;
  contentType: string;
}

export interface FailedUpload {
  ok: false;
  error: string;
  path?: undefined;
  contentType?: undefined;
}

/** Reads the first bytes and verifies real image magic numbers (defeats renamed scripts/executables). */
async function sniffMagic(file: File): Promise<string | null> {
  const buf = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const is = (offset: number, bytes: number[]) => bytes.every((b, i) => buf[offset + i] === b);

  if (is(0, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (is(0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (is(0, [0x52, 0x49, 0x46, 0x46]) && is(8, [0x57, 0x45, 0x42, 0x50])) return "image/webp";
  return null;
}

/**
 * Validates an uploaded file and returns a random UUID object path.
 * Rejects anything that is not a genuine JPG/PNG/WebP — including SVG, HTML,
 * JS, PHP, executables and archives, even when renamed with an image extension.
 */
export async function validateImageUpload(
  file: File,
  folder: string
): Promise<UploadCheck> {
  if (file.size === 0) return { ok: false, error: "The file is empty." };
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "Image is larger than 5 MB." };

  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!(ALLOWED_IMAGE_EXT as readonly string[]).includes(ext)) {
    return { ok: false, error: "Only JPG, PNG and WebP images are allowed." };
  }
  if (!(ALLOWED_IMAGE_MIME as readonly string[]).includes(file.type)) {
    return { ok: false, error: "Only JPG, PNG and WebP images are allowed." };
  }

  const sniffed = await sniffMagic(file);
  if (!sniffed) {
    return { ok: false, error: "This file is not a valid image." };
  }
  if (sniffed !== file.type) {
    return { ok: false, error: "File contents do not match its type." };
  }

  const safeFolder = folder.replace(/[^a-z0-9-]/gi, "").slice(0, 32) || "uploads";
  const uuid =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

  return { ok: true, path: `${safeFolder}/${uuid}.${EXT_BY_MIME[sniffed]}`, contentType: sniffed };
}
