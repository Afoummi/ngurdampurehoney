import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, ShieldCheck, Award } from "lucide-react";
import heroPour from "@/assets/photos/hero-pour.jpg";
import jarsLineup from "@/assets/photos/jars-lineup.jpg";
import beekeeper from "@/assets/photos/beekeeper.jpg";
import { useSiteMedia } from "@/hooks/useSiteMedia";
import { ResolvedImage } from "@/components/common/ResolvedImage";

// Fallback slides used only when the admin has not uploaded any hero slides.
const FALLBACK_SLIDES = [
  { image: heroPour, title: "The taste of pure Nigerian honey", subtitle: "Hand-poured, unfiltered." },
  { image: jarsLineup, title: "From single jars to family gallons", subtitle: "For every household." },
  { image: beekeeper, title: "Harvested by hand in Gembu", subtitle: "Taraba highlands." },
];

export function HeroSection() {
  const { entries } = useSiteMedia("hero_slide");
  const slides = entries.length > 0
    ? entries.map((e) => ({ image: e.image_url, title: e.title || "Ngurdam Pure Honey", subtitle: e.subtitle || "" }))
    : FALLBACK_SLIDES;

  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(id);
  }, [slides.length]);

  const currentSlide = slides[index] ?? slides[0];

  return (
    <section className="relative overflow-hidden bg-background">
      <div className="container py-10 md:py-16 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Copy */}
          <div className="lg:col-span-6 space-y-6 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-honey-cream border border-honey/20 text-xs font-medium uppercase tracking-[0.15em] text-honey-deep">
              <Leaf className="w-3.5 h-3.5" /> 100% Raw &amp; Natural
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-foreground">
              The taste of{" "}
              <span className="italic text-honey-deep">pure Nigerian</span>{" "}
              honey, delivered.
            </h1>

            <p className="text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              Ngurdam Honey is harvested by hand from the pristine highlands of
              Gembu, Taraba State — unfiltered, unprocessed, and full of nature's
              goodness. Carefully packaged in Sokoto for families across Nigeria.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Button asChild variant="honey" size="lg">
                <Link to="/products">
                  Shop the Collection <ArrowRight className="ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/about">Our Story</Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-5 pt-6 border-t border-border/60">
              <Stat icon={Leaf}     label="Pure"        value="100%" />
              <Stat icon={ShieldCheck} label="NAFDAC" value="A+"  />
              <Stat icon={Award}    label="Families"   value="500+" />
            </div>
          </div>

          {/* Slideshow */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-8 bg-honey/15 rounded-[3rem] blur-3xl -z-10" />
            <div className="relative aspect-[4/5] md:aspect-[5/6] rounded-[2.5rem] overflow-hidden shadow-lift ring-1 ring-border/40">
              {slides.map((s, i) => (
                <img
                  key={i}
                  src={s.image}
                  alt={s.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === index ? "opacity-100" : "opacity-0"}`}
                  width={1600}
                  height={1200}
                  loading={i === 0 ? "eager" : "lazy"}
                  fetchPriority={i === 0 ? "high" : "auto"}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] opacity-80">Featured</p>
                  <p className="font-display text-2xl mt-1 leading-tight">{currentSlide.title}</p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] opacity-80 text-right">
                  {currentSlide.subtitle || "Gembu, Taraba"}
                </span>
              </div>

              {slides.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      aria-label={`Go to slide ${i + 1}`}
                      className={`h-1.5 rounded-full transition-all ${i === index ? "bg-white w-6" : "bg-white/50 w-1.5"}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5 text-honey-deep" />
      <div className="leading-tight">
        <p className="font-display text-2xl text-foreground">{value}</p>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
