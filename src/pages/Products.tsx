import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/products/ProductCard";
import { RecentlyViewed } from "@/components/products/RecentlyViewed";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/seo/SEO";
import { Product, fetchProducts } from "@/lib/products";
import { Package, Search, X } from "lucide-react";
import honeycomb from "@/assets/photos/honeycomb.jpg";

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  useEffect(() => {
    fetchProducts(48).then((d) => {
      setProducts(d);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean) as string[]);
    return Array.from(set);
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q) ||
        (p.size ?? "").toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q)
      );
    });
  }, [products, query, category]);

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="Shop Ngurdam Pure Honey — Raw Nigerian Honey Online"
        description="Browse our full collection of 100% pure, raw honey from Gembu, Taraba. Jars, bottles and jerrycans delivered nationwide across Nigeria."
        path="/products"
      />
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

        <section className="py-10 md:py-14 border-b border-border/60 bg-card/40">
          <div className="container flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search honey by name, size, or category…"
                className="pl-9 pr-9 h-11"
                aria-label="Search products"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={category === "all" ? "honey" : "outline"}
                  onClick={() => setCategory("all")}
                >
                  All
                </Button>
                {categories.map((c) => (
                  <Button
                    key={c}
                    size="sm"
                    variant={category === c ? "honey" : "outline"}
                    onClick={() => setCategory(c)}
                  >
                    {c}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                  <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  {query ? `No matches for "${query}"` : "No products yet"}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {query ? "Try a different search or clear filters." : "Our honey collection is being prepared."}
                </p>
                {(query || category !== "all") && (
                  <Button variant="outline" className="mt-6" onClick={() => { setQuery(""); setCategory("all"); }}>
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  Showing {filtered.length} {filtered.length === 1 ? "product" : "products"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
              </>
            )}
          </div>
        </section>

        <RecentlyViewed limit={4} />
      </main>
      <Footer />
    </div>
  );
}
