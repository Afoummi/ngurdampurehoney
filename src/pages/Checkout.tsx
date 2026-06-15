import { useState, useEffect } from "react";
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
import { Loader2, ShoppingBag, ArrowLeft, ShieldCheck, CreditCard } from "lucide-react";
import { z } from "zod";

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(20),
  address: z.string().trim().min(10, "Please enter your full delivery address").max(500),
  notes: z.string().max(1000).optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

// Paystack public test key — safe to expose in frontend
const PAYSTACK_PUBLIC_KEY = "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

function loadPaystack(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) return resolve();
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load Paystack"));
    document.body.appendChild(s);
  });
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});

  const [formData, setFormData] = useState<CheckoutFormData>({
    name: "", email: "", phone: "", address: "", notes: "",
  });

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

  const createOrder = async (reference: string) => {
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
          customerEmail: formData.email.trim().toLowerCase(),
          customerPhone: formData.phone.trim(),
          shippingAddress: formData.address.trim(),
          notes: formData.notes?.trim() || null,
          userId: user?.id || null,
        },
      },
    });

    if (error) throw new Error(error.message);
    if (!data?.success) throw new Error(data?.error || "Failed to create order");

    // Mark order paid with payment reference
    await supabase
      .from("orders")
      .update({ payment_status: "paid", payment_reference: reference, status: "processing" })
      .eq("id", data.order.id);

    return data.order;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);
    try {
      await loadPaystack();

      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: formData.email.trim().toLowerCase(),
        amount: Math.round(totalPrice * 100), // kobo
        currency: "NGN",
        ref: `NGURDAM_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
        metadata: {
          custom_fields: [
            { display_name: "Customer", variable_name: "customer_name", value: formData.name },
            { display_name: "Phone", variable_name: "phone", value: formData.phone },
          ],
        },
        callback: function (response: { reference: string }) {
          (async () => {
            try {
              const order = await createOrder(response.reference);
              clearCart();
              toast.success("Payment successful!", { description: `Reference: ${response.reference}` });
              navigate(`/order-confirmation?orderId=${order.id}&token=${order.accessToken}`);
            } catch (err) {
              toast.error("Order recording failed", {
                description: err instanceof Error ? err.message : "Please contact support with your reference.",
              });
            } finally {
              setIsLoading(false);
            }
          })();
        },
        onClose: function () {
          toast.info("Payment cancelled");
          setIsLoading(false);
        },
      });
      handler.openIframe();
    } catch (error) {
      console.error(error);
      toast.error("Could not start payment", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
      setIsLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12 bg-muted/30">
        <div className="container max-w-5xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Secure <span className="text-gradient">Checkout</span>
          </h1>
          <p className="text-muted-foreground mb-8">Pay securely with Paystack — cards, bank transfer & USSD.</p>

          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Delivery Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={errors.name ? "border-destructive" : ""} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" type="tel" placeholder="08012345678" value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className={errors.phone ? "border-destructive" : ""} />
                        {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={errors.email ? "border-destructive" : ""} />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Textarea id="address" rows={3} value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={errors.address ? "border-destructive" : ""} />
                      {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea id="notes" rows={2} value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                    </div>

                    <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                      ) : (
                        <><CreditCard className="w-5 h-5 mr-2" /> Pay {formatPrice(totalPrice)} with Paystack</>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Secured by Paystack · 256-bit SSL encryption
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" /> Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <div className="w-14 h-14 bg-secondary/20 rounded-md overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">🍯</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{item.productName}</p>
                        <Badge variant="outline" className="mt-1 text-[10px]">Qty {item.quantity}</Badge>
                        <p className="text-sm font-bold text-primary mt-1">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Delivery</span>
                    <span>Arranged after payment</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold">Total</span>
                    <span className="font-display text-2xl font-extrabold text-primary">{formatPrice(totalPrice)}</span>
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
