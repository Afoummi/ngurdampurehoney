import { Link } from "react-router-dom";
import logoAsset from "@/assets/ngurdam-logo.png.asset.json";

export function BrandLogo({ size = "md", showText = true }: { size?: "sm" | "md" | "lg"; showText?: boolean }) {
  const dim = size === "sm" ? "h-10 w-10" : size === "lg" ? "h-14 w-14" : "h-12 w-12";
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";

  return (
    <Link to="/" className="flex items-center gap-2.5 group" aria-label="Ngurdam Honey home">
      <div className={`${dim} flex items-center justify-center shrink-0`}>
        <img src={logoAsset.url} alt="Ngurdam Honey logo" className="w-full h-full object-contain" />
      </div>
      {showText && (
        <div className="leading-none">
          <p className={`font-display ${text} font-normal tracking-tight text-foreground`}>
            Ngurdam <span className="text-honey-deep">Honey</span>
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5 hidden sm:block">
            Pure · Natural · Goodness
          </p>
        </div>
      )}
    </Link>
  );
}
