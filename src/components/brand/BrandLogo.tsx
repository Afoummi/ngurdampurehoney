import { Link } from "react-router-dom";
import logoJar from "@/assets/photos/single-jar.jpg";

export function BrandLogo({ size = "md", showText = true }: { size?: "sm" | "md" | "lg"; showText?: boolean }) {
  const dim = size === "sm" ? "h-9 w-9" : size === "lg" ? "h-12 w-12" : "h-10 w-10";
  const text = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-xl";

  return (
    <Link to="/" className="flex items-center gap-2.5 group" aria-label="Ngurdam Honey home">
      <div className={`${dim} rounded-full overflow-hidden ring-2 ring-honey/30 group-hover:ring-honey transition-all shadow-card bg-honey-cream`}>
        <img src={logoJar} alt="" className="w-full h-full object-cover" />
      </div>
      {showText && (
        <div className="leading-none">
          <p className={`font-display ${text} font-normal tracking-tight text-foreground`}>
            Ngurdam <span className="text-honey-deep">Honey</span>
          </p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5 hidden sm:block">
            AB Sardauna Ngurdam
          </p>
        </div>
      )}
    </Link>
  );
}
