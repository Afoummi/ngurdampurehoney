import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-honey-gradient p-8 md:p-16 text-center">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
              Ready to Taste Pure Nature?
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Order your jar of premium honey today and experience the authentic taste of Nigerian honey.
            </p>
            <Button asChild size="lg" variant="secondary" className="bg-background text-foreground hover:bg-background/90">
              <Link to="/products">
                Shop Collection <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
