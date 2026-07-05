import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, Users, Target, Award, MapPin } from "lucide-react";
import beekeeper from "@/assets/photos/beekeeper.jpg";
import honeycomb from "@/assets/photos/honeycomb.jpg";
import { BRAND } from "@/lib/brand";
import { SEO } from "@/components/seo/SEO";

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Our Story — Ngurdam Pure Honey from Gembu, Taraba"
        description="How AB Sardauna Ngurdam Ventures hand-harvests raw honey from the Gembu highlands and bottles it in Sokoto for families across Nigeria."
        path="/about"
      />
      <Navbar />
      <main className="flex-1">
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium">Our Story</p>
                <h1 className="font-display text-5xl md:text-6xl leading-tight">
                  Pure honey, <span className="italic text-honey-deep">straight from the highlands of Gembu.</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {BRAND.legalName} was founded with a simple mission: to bring the
                  purest, most authentic honey from the beautiful highlands of
                  Gembu, Sardauna Local Government Area, Taraba State, directly to
                  families across Nigeria.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Ngurdam Honey is 100% pure, raw, and naturally harvested,
                  preserving its rich flavour, aroma, and nutritional benefits just
                  as nature intended.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We proudly work with experienced local beekeepers who practice
                  sustainable and ethical harvesting methods. Every bottle is
                  carefully processed, quality-checked, and professionally packaged
                  in Sokoto to ensure our customers receive premium honey they can
                  trust.
                </p>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground pt-2">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-honey-deep" />
                    Sourced in {BRAND.origin.short}
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-honey-deep" />
                    Packaged in Sokoto
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-honey-cream border border-honey/30 text-xs font-medium text-honey-deep mt-2">
                  NAFDAC Reg. No. {BRAND.nafdacNumber}
                </div>
              </div>

              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-lift">
                <img src={beekeeper} alt="Nigerian beekeeper inspecting a honeycomb frame"
                  className="w-full h-full object-cover" loading="lazy" />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-honey-cream/40">
          <div className="container">
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium mb-3">What we stand for</p>
              <h2 className="font-display text-4xl md:text-5xl leading-tight">
                Four <span className="italic text-honey-deep">simple</span> values
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { icon: Heart, title: "Purity", text: "100% natural with zero additives, preservatives, or processing shortcuts." },
                { icon: Users, title: "Community", text: "Supporting local Nigerian beekeepers and their families through fair trade." },
                { icon: Target, title: "Sustainability", text: "Environmentally responsible practices that protect bees and ecosystems." },
                { icon: Award, title: "Quality", text: "Independent lab testing and rigorous quality control on every batch." },
              ].map((v) => (
                <Card key={v.title} className="border-border/60 hover:shadow-lift hover:border-honey/30 transition-all">
                  <CardContent className="p-6 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-honey-cream flex items-center justify-center">
                      <v.icon className="w-6 h-6 text-honey-deep" />
                    </div>
                    <h3 className="font-display text-2xl">{v.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="aspect-[5/4] rounded-3xl overflow-hidden shadow-lift order-2 lg:order-1">
                <img src={honeycomb} alt="Close-up of golden honeycomb dripping honey"
                  className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="space-y-6 order-1 lg:order-2">
                <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium">Our Mission</p>
                <h2 className="font-display text-4xl md:text-5xl leading-tight">
                  Honey, the way <span className="italic text-honey-deep">it should be.</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  To deliver the purest, most delicious honey while supporting local
                  beekeeping communities and promoting sustainable agriculture across
                  Nigeria — one golden jar at a time.
                </p>
                <div className="grid grid-cols-3 gap-6 pt-4 border-t border-border/60">
                  <Stat value="5+" label="Years" />
                  <Stat value="50+" label="Beekeepers" />
                  <Stat value="500+" label="Happy customers" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-display text-4xl text-honey-deep leading-none">{value}</p>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mt-2">{label}</p>
    </div>
  );
}
