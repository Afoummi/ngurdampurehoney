import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/products/ProductGrid";
import honeycomb from "@/assets/photos/honeycomb.jpg";

export default function Products() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="relative bg-forest-gradient text-primary-foreground overflow-hidden">
          <img src={honeycomb} alt="" aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity" loading="lazy" />
          <div className="absolute inset-0 bg-forest-gradient/80" />
          <div className="relative container py-20 md:py-28 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-honey font-medium mb-4">Shop</p>
            <h1 className="font-display text-5xl md:text-6xl text-honey-cream mb-5 leading-tight">
              The Ngurdam <span className="italic text-honey">collection</span>
            </h1>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg leading-relaxed">
              Browse our full lineup of raw, hand-bottled honey — from 1 Litre jars
              to 20 Litre gallons. Every drop sourced from Nigerian apiaries.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container">
            <ProductGrid limit={20} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
