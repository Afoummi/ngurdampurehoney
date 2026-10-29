import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Product, fetchProductById, fetchProducts, formatPrice } from "@/lib/products";
import { ProductCard } from "@/components/products/ProductCard";
import { RecentlyViewed } from "@/components/products/RecentlyViewed";
import { trackRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { SEO } from "@/components/seo/SEO";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart, Minus, Plus, ArrowLeft, ShieldCheck, Truck, Leaf } from "lucide-react";
import { useImageSrc } from "@/hooks/useImageSrc";
import jarsLineup from "@/assets/photos/jars-lineup.jpg";

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const imageSrc = useImageSrc(product?.image_url, jarsLineup);

  useEffect(() => {
    async function load() {
      if (!handle) return;
      setLoading(true);
      try {
        const data = await fetchProductById(handle);
        setProduct(data);
        if (data) trackRecentlyViewed(data.id);
        const all = await fetchProducts(12);
        const sameCategory = data?.category
          ? all.filter((p) => p.id !== handle && p.category === data.category)
          : [];
        const others = all.filter((p) => p.id !== handle);
        const picks = (sameCategory.length > 0 ? sameCategory : others).slice(0, 4);
        setRelated(picks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [handle]);

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    addItem({
      productId: product.id,
      productName: product.name,
      price: product.price,
      quantity,
      imageUrl: product.image_url,
    });
    toast.success("Added to cart", {
      description: `${quantity}× ${product.name}`,
      position: "top-center",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-12">
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-20 text-center">
          <h1 className="font-display text-3xl mb-4">Product not found</h1>
          <Button asChild variant="honey"><Link to="/products">Browse Products</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container py-10 md:py-14">
          <Button variant="ghost" asChild className="mb-6 -ml-3">
            <Link to="/products"><ArrowLeft className="w-4 h-4" /> Back to Products</Link>
          </Button>

          <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
            <div className="space-y-4">
              <div className="aspect-square rounded-3xl overflow-hidden bg-honey-cream shadow-lift">
                <img src={imageSrc} alt={product.name}
                  className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                {(product.package_size || product.size) && (
                  <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium">
                    {product.package_size || product.size}
                  </p>
                )}
                <h1 className="font-display text-4xl md:text-5xl leading-tight">{product.name}</h1>
                <p className="font-display text-4xl text-honey-deep">{formatPrice(product.price)}</p>
              </div>

              {product.container_type && (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-honey/40 text-honey-deep bg-honey-cream">
                    {product.container_type}
                  </Badge>
                  {product.package_size && (
                    <Badge variant="secondary">{product.package_size}</Badge>
                  )}
                </div>
              )}

              <p className="text-muted-foreground leading-relaxed text-lg">
                {product.description || "Raw, unfiltered honey from Ngurdam apiaries — golden, fragrant, and full of natural goodness."}
              </p>

              <div className="flex items-center gap-2 text-sm">
                {product.stock > 0 ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-success" />
                    <span className="text-success font-medium">In stock</span>
                    <span className="text-muted-foreground">· {product.stock} available</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-destructive" />
                    <span className="text-destructive font-medium">Out of stock</span>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="qty">Quantity</label>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span id="qty" className="w-14 text-center font-display text-xl">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} aria-label="Increase quantity">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Button variant="honey" size="xl" className="w-full" onClick={handleAddToCart} disabled={product.stock <= 0}>
                <ShoppingCart className="w-5 h-5" />
                {product.stock <= 0 ? "Out of Stock" : `Add to Cart — ${formatPrice(product.price * quantity)}`}
              </Button>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/60">
                <Trust icon={Leaf} label="100% Raw" />
                <Trust icon={ShieldCheck} label="Lab Tested" />
                <Trust icon={Truck} label="Nationwide" />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-honey-cream border border-honey/30 text-honey-deep font-medium">
                  NAFDAC Reg. A8-121062L
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/60">
                  Sourced: Gembu, Taraba
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border border-border/60">
                  Packaged: Sokoto
                </span>
              </div>

              <Accordion type="single" collapsible className="border-t border-border/60 pt-4">
                <AccordionItem value="desc">
                  <AccordionTrigger>About this honey</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {product.description || "Raw, unfiltered honey harvested by hand from the highlands of Gembu, Sardauna LGA, Taraba State, and professionally packaged in Sokoto. NAFDAC Reg. A8-121062L."} It crystallizes naturally over time — gently warm to restore its smooth flow.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="ship">
                  <AccordionTrigger>Shipping &amp; Delivery</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    We deliver nationwide. Once you complete checkout we'll confirm pricing and delivery time with you on WhatsApp.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="store">
                  <AccordionTrigger>Storage</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    Store in a cool, dry place away from direct sunlight. Properly stored, raw honey lasts indefinitely.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-24" aria-labelledby="related-heading">
              <div className="flex items-end justify-between mb-8">
                <h2 id="related-heading" className="font-display text-3xl md:text-4xl">
                  You may also <span className="italic text-honey-deep">love</span>
                </h2>
                <Button asChild variant="ghost"><Link to="/products">View all →</Link></Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {related.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
            </section>
          )}
        </div>

        <RecentlyViewed excludeId={product.id} />
      </main>
      <Footer />
      <SEO
        title={`${product.name}${product.size ? ` (${product.size})` : ""} — Ngurdam Pure Honey`}
        description={product.description || `Buy ${product.name} — raw unfiltered Nigerian honey from Ngurdam.`}
        path={`/product/${product.id}`}
        image={imageSrc || undefined}
        type="product"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.description || undefined,
          image: imageSrc || undefined,
          brand: { "@type": "Brand", name: "Ngurdam Pure Honey" },
          offers: {
            "@type": "Offer",
            price: product.price,
            priceCurrency: "NGN",
            availability: product.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
            url: `https://ngurdamhoney.lovable.app/product/${product.id}`,
          },
        }}
      />
    </div>
  );
}

function Trust({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 text-center p-3 rounded-lg bg-honey-cream/50">
      <Icon className="w-5 h-5 text-honey-deep" />
      <span className="text-xs font-medium text-foreground">{label}</span>
    </div>
  );
}
