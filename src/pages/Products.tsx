import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/products/ProductGrid";

export default function Products() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <section className="bg-card py-12 md:py-20">
          <div className="container text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              Our <span className="text-gradient">Honey</span> Collection
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Browse our selection of premium, 100% natural honey products. 
              Each jar is packed with pure goodness from Nigerian apiaries.
            </p>
          </div>
        </section>

        {/* Products */}
        <section className="py-12 md:py-16">
          <div className="container">
            <ProductGrid limit={20} />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
