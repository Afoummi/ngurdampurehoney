import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { ProductCard } from "./ProductCard";

export function RecentlyViewed({ excludeId, limit = 4 }: { excludeId?: string; limit?: number }) {
  const { products } = useRecentlyViewed(excludeId, limit);
  if (products.length === 0) return null;

  return (
    <section className="py-14 md:py-20 border-t border-border/60" aria-labelledby="recently-viewed-heading">
      <div className="container">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium mb-2">For you</p>
          <h2 id="recently-viewed-heading" className="font-display text-3xl md:text-4xl leading-tight">
            Recently <span className="italic text-honey-deep">viewed</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </section>
  );
}
