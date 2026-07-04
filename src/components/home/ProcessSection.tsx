import beekeeperImg from "@/assets/photos/beekeeper.jpg";
import honeycombImg from "@/assets/photos/honeycomb.jpg";
import jarsLineupImg from "@/assets/photos/jars-lineup.jpg";

const steps = [
  {
    n: "01",
    title: "Harvested in Gembu",
    body: "Our beekeepers in the highlands of Gembu, Sardauna LGA, work traditional apiaries surrounded by wildflowers and forest — the source of Ngurdam's distinct floral notes.",
    image: beekeeperImg,
  },
  {
    n: "02",
    title: "Cold-strained, never heated",
    body: "Combs are opened and honey is strained at ambient temperature to preserve enzymes, pollen and natural aromatics. No pasteurisation. No filtering out the good stuff.",
    image: honeycombImg,
  },
  {
    n: "03",
    title: "Packaged in Sokoto",
    body: "Every jar is filled, sealed and quality-checked at our NAFDAC-registered facility in Sokoto — then dispatched fresh to your door across Nigeria.",
    image: jarsLineupImg,
  },
];

export function ProcessSection() {
  return (
    <section className="py-20 md:py-28 bg-background">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium">Our Beekeepers · Our Process</p>
          <h2 className="font-display text-4xl md:text-5xl leading-tight">
            From highland hive to <span className="italic text-honey-deep">your table</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Three careful steps between the wildflowers of Sardauna and the jar in your kitchen.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.n} className="group">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-card mb-5">
                <img
                  src={s.image}
                  alt={s.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
              <p className="font-display text-sm text-honey-deep tracking-widest mb-2">STEP {s.n}</p>
              <h3 className="font-display text-2xl mb-2">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
