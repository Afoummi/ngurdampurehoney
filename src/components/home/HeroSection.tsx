import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Leaf, ShieldCheck, Award } from "lucide-react";
import heroPour from "@/assets/photos/hero-pour.jpg";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="container py-14 md:py-24">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Copy */}
          <div className="lg:col-span-6 space-y-7 animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-honey-cream border border-honey/20 text-xs font-medium uppercase tracking-[0.15em] text-honey-deep">
              <Leaf className="w-3.5 h-3.5" /> 100% Raw &amp; Natural
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-foreground">
              The taste of{" "}
              <span className="italic text-honey-deep">pure Nigerian</span>{" "}
              honey, delivered.
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Ngurdam Honey is harvested by hand from the pristine highlands of
              Gembu, Taraba State — unfiltered, unprocessed, and full of nature's
              goodness. Carefully packaged in Sokoto for families across Nigeria.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button asChild variant="honey" size="lg">
                <Link to="/products">
                  Shop the Collection <ArrowRight className="ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/about">Our Story</Link>
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-5 pt-8 border-t border-border/60">
              <Stat icon={Leaf}     label="Pure"        value="100%" />
              <Stat icon={ShieldCheck} label="Lab Tested" value="A+"  />
              <Stat icon={Award}    label="Customers"   value="500+" />
            </div>
          </div>

          {/* Image */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-8 bg-honey/15 rounded-[3rem] blur-3xl -z-10" />
            <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-lift ring-1 ring-border/40">
              <img
                src={heroPour}
                alt="Pure golden Ngurdam honey being poured from a wooden honey dipper"
                className="w-full h-full object-cover"
                width={1600}
                height={1200}
                fetchPriority="high"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-primary-foreground">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] opacity-80">Featured</p>
                  <p className="font-display text-2xl mt-1">Raw Wildflower</p>
                </div>
                <span className="text-xs uppercase tracking-[0.2em] opacity-80">Gembu, Taraba</span>
              </div>
            </div>

            {/* Floating badge */}
            <div className="hidden md:flex absolute -left-6 top-10 bg-card shadow-lift rounded-2xl px-5 py-4 items-center gap-3 ring-1 ring-border/60 animate-float">
              <div className="w-10 h-10 rounded-full bg-honey-cream flex items-center justify-center">
                <Award className="w-5 h-5 text-honey-deep" />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Trusted by</p>
                <p className="text-sm font-semibold">500+ households</p>
              </div>
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
