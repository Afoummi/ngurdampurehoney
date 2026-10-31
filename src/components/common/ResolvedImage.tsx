import { useImageSrc } from "@/hooks/useImageSrc";

/**
 * Renders a stored image reference (storage path, getPublicUrl-style URL,
 * bundled asset or external URL) through the signed-URL resolver.
 *
 * Use this for any image that may live in the private `product-images`
 * bucket; plain bundled-asset <img> tags do not need it.
 */
interface ResolvedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
  image: string | null | undefined;
}

export function ResolvedImage({ image, ...imgProps }: ResolvedImageProps) {
  const resolved = useImageSrc(image);
  return <img {...imgProps} src={resolved || image || ""} />;
}
