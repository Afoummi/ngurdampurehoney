import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { WhyChooseSection } from "@/components/home/WhyChooseSection";
import { HealthBenefitsSection } from "@/components/home/HealthBenefitsSection";
import { FAQSection } from "@/components/home/FAQSection";
import { ContactCTASection } from "@/components/home/ContactCTASection";
import { TrustSection } from "@/components/home/TrustSection";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { ProcessSection } from "@/components/home/ProcessSection";
import { PromoBanner } from "@/components/home/PromoBanner";
import { ProductGrid } from "@/components/products/ProductGrid";
import { RecentlyViewed } from "@/components/products/RecentlyViewed";
import { SEO, ORG_JSONLD } from "@/components/seo/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Ngurdam Honey — Pure Raw Nigerian Honey from Gembu, Taraba"
        description="100% pure, raw honey harvested by hand from the highlands of Gembu, Taraba State. NAFDAC registered. Delivered nationwide."
        path="/"
        jsonLd={[ORG_JSONLD, {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Ngurdam Honey",
          url: "https://ngurdamhoney.lovable.app",
        }]}
      />
      <PromoBanner />
      <Navbar />
      <main className="flex-1" id="main">
        <HeroSection />

        <TrustSection />

        <WhyChooseSection />

        {/* Featured Products */}
        <section className="py-20 md:py-28" aria-labelledby="featured-heading">
          <div className="container">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div className="max-w-2xl space-y-3">
                <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium">Shop</p>
                <h2 id="featured-heading" className="font-display text-4xl md:text-5xl leading-tight">
                  The Ngurdam <span className="italic text-honey-deep">collection</span>
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  From single jars to family-sized jerrycans — pure honey for every household.
                </p>
              </div>
              <Button asChild variant="outline" size="lg">
                <Link to="/products">
                  View All Products <ArrowRight className="ml-1" />
                </Link>
              </Button>
            </div>
            <ProductGrid limit={4} />
          </div>
        </section>

        <HealthBenefitsSection />

        <ProcessSection />

        <TestimonialsSection />

        <FAQSection />

        <RecentlyViewed limit={4} />

        <ContactCTASection />
      </main>
      <Footer />
    </div>
  );
}
