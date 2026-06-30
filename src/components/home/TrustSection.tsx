import { ShieldCheck, Leaf, MapPin, Package } from "lucide-react";
import { BRAND } from "@/lib/brand";

const items = [
  {
    icon: Leaf,
    title: "100% Pure & Natural",
    text: "Raw, unfiltered honey with zero additives or processing shortcuts.",
  },
  {
    icon: MapPin,
    title: "Sourced from Gembu",
    text: "Harvested from the pristine highlands of Sardauna LGA, Taraba State.",
  },
  {
    icon: ShieldCheck,
    title: "NAFDAC Registered",
    text: `Officially certified — Reg. No. ${BRAND.nafdacNumber}.`,
  },
  {
    icon: Package,
    title: "Carefully Packaged",
    text: "Quality-checked and bottled in Sokoto by AB Sardauna Ngurdam Ventures.",
  },
];

export function TrustSection() {
  return (
    <section className="py-16 md:py-20 border-y border-border/60 bg-card" aria-labelledby="trust-heading">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium mb-3">Quality Assurance</p>
          <h2 id="trust-heading" className="font-display text-3xl md:text-4xl leading-tight">
            Why trust <span className="italic text-honey-deep">Ngurdam Honey</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl border border-border/60 bg-background p-5 hover:shadow-card hover:border-honey/30 transition-all">
              <div className="w-11 h-11 rounded-xl bg-honey-cream flex items-center justify-center mb-3">
                <it.icon className="w-5 h-5 text-honey-deep" />
              </div>
              <p className="font-display text-xl mb-1.5 leading-tight">{it.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
