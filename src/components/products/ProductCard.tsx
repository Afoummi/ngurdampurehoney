import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { Product, formatPrice } from "@/lib/products";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { useImageSrc } from "@/hooks/useImageSrc";
import jarsLineup from "@/assets/photos/jars-lineup.jpg";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((s) => s.addItem);
  const imageSrc = useImageSrc(product.image_url, jarsLineup);
  const lowStock = product.stock > 0 && product.stock < 5;
  const outOfStock = product.stock <= 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) {
      toast.error("Out of stock");
      return;
    }
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: product.image_url,
    });
    toast.success("Added to cart", {
      description: `${product.name} — ${formatPrice(product.price)}`,
      position: "top-center",
    });
  };

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <article className="rounded-2xl overflow-hidden bg-card border border-border/60 hover:border-honey/40 hover:shadow-lift transition-all duration-500">
        <div className="relative aspect-square overflow-hidden bg-honey-cream">
            <img
             src={imageSrc}
            alt={`${product.name}${product.size ? ` — ${product.size}` : ""}`}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
          />

          {/* Size pill */}
          {(product.package_size || product.size) && (
            <div className="absolute top-4 left-4 bg-background/95 backdrop-blur px-3 py-1 rounded-full shadow-card">
              <p className="text-[10px] uppercase tracking-[0.15em] font-semibold text-foreground">
                {product.package_size || product.size}
              </p>
            </div>
          )}

          {/* Stock badge */}
          {lowStock && (
            <Badge className="absolute top-4 right-4 bg-warning text-warning-foreground border-0 shadow-card">
              Only {product.stock} left
            </Badge>
          )}
          {outOfStock && (
            <Badge className="absolute top-4 right-4 bg-muted text-muted-foreground border-0">
              Sold Out
            </Badge>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="font-display text-xl leading-tight text-foreground group-hover:text-honey-deep transition-colors">
              {product.name}
            </h3>
            {product.container_type && (
              <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-honey-deep">
                {product.container_type}
              </p>
            )}
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {product.description || "Hand-harvested raw honey from Ngurdam apiaries."}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/60">
            <p className="font-display text-2xl text-foreground leading-none">
              {formatPrice(product.price)}
            </p>
            <Button
              variant="honey"
              size="sm"
              onClick={handleAdd}
              disabled={outOfStock}
              aria-label={`Add ${product.name} to cart`}
            >
              <ShoppingCart className="h-4 w-4" />
              {outOfStock ? "Sold" : "Add"}
            </Button>
          </div>
        </div>
      </article>
    </Link>
  );
}
