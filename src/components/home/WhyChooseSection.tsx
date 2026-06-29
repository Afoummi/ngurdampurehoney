import { Leaf, ShieldCheck, Heart, Truck } from "lucide-react";
import jarsLineup from "@/assets/photos/jars-lineup.jpg";

const features = [
  {
    icon: Leaf,
    title: "100% Pure & Raw",
    description: "Unfiltered, unprocessed, with nothing added. Just honey as nature intended.",
  },
  {
    icon: ShieldCheck,
    title: "Lab-Tested Quality",
    description: "Every batch is independently tested for purity and authenticity before bottling.",
  },
  {
    icon: Heart,
    title: "Ethically Sourced",
    description: "Sourced direct from Nigerian beekeepers at fair prices — supporting local communities.",
  },
  {
    icon: Truck,
    title: "Nationwide Delivery",
    description: "Order via WhatsApp and we'll deliver fresh honey to your doorstep across Nigeria.",
  },
];

export function WhyChooseSection() {
  return (
    <section className="py-20 md:py-28 bg-honey-cream/40">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative order-2 lg:order-1">
            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lift">
              <img
                src={jarsLineup}
                alt="Lineup of Ngurdam honey jars on a rustic wooden table"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-card rounded-2xl shadow-lift p-5 max-w-[200px] hidden md:block">
              <p className="font-display text-4xl text-honey-deep leading-none">5★</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-2">
                Average rating from verified buyers
              </p>
            </div>
          </div>

          <div className="space-y-8 order-1 lg:order-2">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium">Why Ngurdam</p>
              <h2 className="font-display text-4xl md:text-5xl leading-tight">
                The difference is in <span className="italic text-honey-deep">every drop.</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                We hold our honey to one simple standard: it should taste like the
                wildflowers it came from. No shortcuts. No additives. Just real honey.
              </p>
            </div>

            <ul className="grid sm:grid-cols-2 gap-5">
              {features.map((f) => (
                <li key={f.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-card shadow-card border border-border/60 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-5 h-5 text-honey-deep" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{f.title}</p>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {f.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
