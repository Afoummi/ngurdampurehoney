import wellness from "@/assets/photos/wellness.jpg";

const benefits = [
  { title: "Natural Energy", text: "Slow-release glucose for sustained, jitter-free energy." },
  { title: "Immune Support", text: "Rich in antioxidants and antibacterial compounds." },
  { title: "Soothing Throat", text: "Time-tested relief for sore throats and seasonal coughs." },
  { title: "Skin & Hair", text: "A natural humectant — used in masks, scrubs, and balms." },
  { title: "Better Sleep", text: "A spoonful before bed supports restful sleep cycles." },
  { title: "Wound Care", text: "Traditional antibacterial dressing for minor cuts and burns." },
];

export function HealthBenefitsSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="aspect-square rounded-3xl overflow-hidden shadow-lift">
              <img
                src={wellness}
                alt="A cup of honey tea with ginger, mint and lemon on a linen surface"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium">Health Benefits</p>
              <h2 className="font-display text-4xl md:text-5xl leading-tight">
                One golden jar.{" "}
                <span className="italic text-honey-deep">A lifetime of benefits.</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg max-w-xl">
                Raw honey isn't just a sweetener — it's a daily wellness ritual used
                across generations for energy, immunity, and natural healing.
              </p>
            </div>

            <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
              {benefits.map((b) => (
                <li key={b.title} className="border-l-2 border-honey pl-4 py-1">
                  <p className="font-display text-xl text-foreground leading-tight">{b.title}</p>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{b.text}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
