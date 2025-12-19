import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--honey-cream))] via-background to-background opacity-50" />
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full bg-[hsl(var(--honey-gold))] opacity-10 blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-48 h-48 rounded-full bg-[hsl(var(--honey-amber))] opacity-10 blur-3xl animate-float" style={{ animationDelay: '-3s' }} />
      
      <div className="container relative py-20 md:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <span>🍯</span> 100% Pure Natural Honey
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Discover{" "}
              <span className="text-gradient">Ngurdam Pure Honey</span>{" "}
              – Nature's Finest
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-lg">
              AB Sardauna brings you Ngurdam Pure Honey – premium, unprocessed honey 
              sourced directly from Nigerian apiaries. Pure taste, natural goodness, delivered to your doorstep.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link to="/products">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/about">Learn Our Story</Link>
              </Button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div>
                <p className="text-3xl font-bold text-primary">100%</p>
                <p className="text-sm text-muted-foreground">Natural</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <p className="text-3xl font-bold text-primary">500+</p>
                <p className="text-sm text-muted-foreground">Happy Customers</p>
              </div>
              <div className="w-px h-12 bg-border" />
              <div>
                <p className="text-3xl font-bold text-primary">5★</p>
                <p className="text-sm text-muted-foreground">Rating</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square max-w-lg mx-auto relative">
              <div className="absolute inset-0 bg-honey-gradient rounded-full opacity-20 blur-3xl" />
              <div className="relative z-10 w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-[hsl(var(--honey-gold))] to-[hsl(var(--honey-amber))] p-1">
                <div className="w-full h-full rounded-3xl bg-card flex items-center justify-center">
                  <span className="text-[180px] animate-float">🍯</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
