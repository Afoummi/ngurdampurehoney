import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/products";
import { toast } from "sonner";
import { Loader2, ShoppingBag, ArrowLeft, ShieldCheck, MessageCircle, MapPin } from "lucide-react";
import { z } from "zod";
import { BRAND } from "@/lib/brand";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import jarsLineup from "@/assets/photos/jars-lineup.jpg";

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(20),
  address: z.string().trim().min(5, "Please enter your delivery address").max(500),
  state: z.string().trim().min(2, "State is required").max(50),
  city: z.string().trim().min(2, "City is required").max(50),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  notes: z.string().max(1000).optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});

  const [formData, setFormData] = useState<CheckoutFormData>({
    name: "", phone: "", address: "", state: "", city: "", email: "", notes: "",
  });

  const totalPrice = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  useEffect(() => {
    if (items.length === 0) navigate("/products");
  }, [items, navigate]);

  useEffect(() => {
    if (user) {
      (async () => {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, phone, address")
          .eq("user_id", user.id)
          .maybeSingle();

        setFormData((prev) => ({
          ...prev,
          name: data?.full_name || prev.name,
          email: user.email || prev.email,
          phone: data?.phone || prev.phone,
          address: data?.address || prev.address,
        }));
      })();
    }
  }, [user]);

  const validateForm = (): boolean => {
    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as keyof CheckoutFormData] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const buildWhatsAppMessage = (orderId?: string) => {
    const itemsText = items
      .map((i, idx) => `${idx + 1}. ${i.productName}  x${i.quantity}  —  ${formatPrice(i.price * i.quantity)}`)
      .join("\n");

    const fullAddress = `${formData.address.trim()}, ${formData.city.trim()}, ${formData.state.trim()}`;

    return [
      `*New Order — Ngurdam Honey*`,
      orderId ? `Reference: ${orderId.slice(0, 8).toUpperCase()}` : "",
      ``,
      `*Customer*`,
      `Name: ${formData.name.trim()}`,
      `Phone: ${formData.phone.trim()}`,
      formData.email ? `Email: ${formData.email.trim()}` : "",
      `Address: ${fullAddress}`,
      ``,
      `*Items*`,
      itemsText,
      ``,
      `*Total: ${formatPrice(totalPrice)}*`,
      ``,
      formData.notes ? `Notes: ${formData.notes.trim()}` : "",
      ``,
      `Please confirm delivery details and payment. Thank you!`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const createOrder = async () => {
    const fullAddress = `${formData.address.trim()}, ${formData.city.trim()}, ${formData.state.trim()}`;
    const orderItems = items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
    }));

    const { data, error } = await supabase.functions.invoke("create-order", {
      body: {
        items: orderItems,
        customerInfo: {
          customerName: formData.name.trim(),
          customerEmail: (formData.email?.trim() || `${formData.phone.trim()}@ngurdam.local`).toLowerCase(),
          customerPhone: formData.phone.trim(),
          shippingAddress: fullAddress,
          notes: formData.notes?.trim() || null,
          userId: user?.id || null,
        },
      },
    });

    if (error) throw new Error(error.message);
    if (!data?.success) throw new Error(data?.error || "Failed to create order");
    return data.order;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    setIsLoading(true);
    try {
      const order = await createOrder();

      const message = encodeURIComponent(buildWhatsAppMessage(order.id));
      const waUrl = `https://wa.me/${BRAND.whatsappNumber}?text=${message}`;

      // Open WhatsApp in a new tab BEFORE async work to keep the user gesture
      const win = window.open(waUrl, "_blank");

      clearCart();
      toast.success("Order placed!", {
        description: "We've opened WhatsApp so you can confirm with us.",
      });

      // Fallback if popup blocked
      if (!win) {
        window.location.href = waUrl;
      }

      // Navigate to confirmation
      navigate(`/order-confirmation?orderId=${order.id}&token=${order.accessToken}`);
    } catch (err) {
      console.error(err);
      toast.error("Could not place order", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-10 md:py-16 bg-honey-cream/30">
        <div className="container max-w-6xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 -ml-3">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>

          <div className="mb-10 max-w-2xl">
            <p className="text-xs uppercase tracking-[0.2em] text-honey-deep font-medium mb-2">Checkout</p>
            <h1 className="font-display text-4xl md:text-5xl leading-tight">
              Finish your order on <span className="italic text-honey-deep">WhatsApp</span>
            </h1>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              Fill in your delivery details, then we'll open WhatsApp so you can
              confirm pricing, delivery and payment directly with our team.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-6">
              <Card className="border-border/60 shadow-card">
                <CardHeader className="border-b border-border/60">
                  <CardTitle className="font-display text-2xl flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-honey-deep" /> Delivery Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field id="name" label="Full Name" required error={errors.name}>
                        <Input id="name" autoComplete="name" value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={errors.name ? "border-destructive" : ""}
                          placeholder="Jane Doe" />
                      </Field>
                      <Field id="phone" label="Phone Number" required error={errors.phone}>
                        <Input id="phone" type="tel" autoComplete="tel"
                          placeholder="08012345678"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={errors.phone ? "border-destructive" : ""} />
                      </Field>
                    </div>

                    <Field id="email" label="Email (optional)" error={errors.email}>
                      <Input id="email" type="email" autoComplete="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={errors.email ? "border-destructive" : ""} />
                    </Field>

                    <Field id="address" label="Delivery Address" required error={errors.address}>
                      <Textarea id="address" rows={2} autoComplete="street-address"
                        placeholder="House number, street, area"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={errors.address ? "border-destructive" : ""} />
                    </Field>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field id="city" label="City" required error={errors.city}>
                        <Input id="city" autoComplete="address-level2"
                          placeholder="e.g. Lagos"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className={errors.city ? "border-destructive" : ""} />
                      </Field>
                      <Field id="state" label="State" required error={errors.state}>
                        <Input id="state" autoComplete="address-level1"
                          placeholder="e.g. Lagos State"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className={errors.state ? "border-destructive" : ""} />
                      </Field>
                    </div>

                    <Field id="notes" label="Order Notes (optional)">
                      <Textarea id="notes" rows={2}
                        placeholder="Landmark, gate color, preferred delivery time..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                    </Field>

                    <Button type="submit" variant="honey" size="lg" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Preparing...</>
                      ) : (
                        <><MessageCircle className="w-5 h-5" /> Continue on WhatsApp · {formatPrice(totalPrice)}</>
                      )}
                    </Button>

                    <p className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-1">
                      <ShieldCheck className="w-4 h-4 text-success" />
                      Your details stay private. We confirm payment over WhatsApp.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card className="sticky top-24 border-border/60 shadow-card">
                <CardHeader className="border-b border-border/60">
                  <CardTitle className="font-display text-xl flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-honey-deep" /> Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <div className="w-16 h-16 bg-honey-cream rounded-lg overflow-hidden flex-shrink-0">
                        <img src={item.imageUrl || jarsLineup} alt={item.productName}
                          className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-tight">{item.productName}</p>
                        <Badge variant="outline" className="mt-1 text-[10px]">Qty {item.quantity}</Badge>
                        <p className="text-sm font-display text-honey-deep mt-1.5">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Delivery</span>
                    <span>Confirmed on WhatsApp</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-baseline">
                    <span className="text-base font-semibold">Total</span>
                    <span className="font-display text-3xl text-honey-deep">{formatPrice(totalPrice)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({ id, label, required, error, children }: { id: string; label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  );
}
