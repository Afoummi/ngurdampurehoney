import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { Product, formatPrice } from "@/lib/products";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.stock <= 0) {
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
      description: `${product.name} has been added to your cart.`,
      position: "top-center",
    });
  };

  const lowStock = product.stock > 0 && product.stock < 5;

  return (
    <Link to={`/product/${product.id}`} className="block group">
      <Card className="overflow-hidden border border-border/60 hover:border-primary/60 transition-all duration-300 hover:shadow-xl rounded-2xl bg-card">
        <div className="relative aspect-square overflow-hidden bg-secondary/20">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={`${product.name}${product.size ? ` – ${product.size}` : ""}`}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl">🍯</div>
          )}
          {lowStock && (
            <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground">
              Only {product.stock} left
            </Badge>
          )}
          {product.stock <= 0 && (
            <Badge className="absolute top-3 right-3 bg-muted text-muted-foreground">
              Sold Out
            </Badge>
          )}
        </div>

        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            {product.size && (
              <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-primary">
                {product.size}
              </p>
            )}
            <h3 className="font-display font-bold text-xl leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description || "Pure natural honey from Ngurdam."}
            </p>
          </div>

          <div className="flex items-end justify-between pt-2 border-t border-border/40">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Price</p>
              <p className="font-display text-2xl font-extrabold text-foreground leading-none">
                {formatPrice(product.price)}
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className="bg-primary hover:bg-primary/90 shadow-sm"
            >
              <ShoppingCart className="w-4 h-4 mr-1.5" />
              {product.stock <= 0 ? "Sold" : "Add"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
