import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { CTASection } from "@/components/home/CTASection";
import { PromoBanner } from "@/components/home/PromoBanner";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <PromoBanner />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        
        {/* Products Preview Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
                  Our <span className="text-gradient">Honey</span> Collection
                </h2>
                <p className="text-muted-foreground">
                  Discover our range of premium, natural honey products.
                </p>
              </div>
              <Button asChild variant="outline">
                <Link to="/products">
                  View All Products <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <ProductGrid limit={4} />
          </div>
        </section>

        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
