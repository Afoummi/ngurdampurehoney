import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cartStore";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/products";
import { toast } from "sonner";
import { Loader2, MessageCircle, ShoppingBag, ArrowLeft } from "lucide-react";
import { z } from "zod";

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(255),
  phone: z.string().trim().min(10, "Please enter a valid phone number").max(20),
  address: z.string().trim().min(10, "Please enter your full delivery address").max(500),
  notes: z.string().max(1000).optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const WHATSAPP_NUMBER = "2348027798163";

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
      const fetchProfile = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, phone, address")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data) {
          setFormData(prev => ({
            ...prev,
            name: data.full_name || prev.name,
            email: user.email || prev.email,
            phone: data.phone || prev.phone,
            address: data.address || prev.address,
          }));
        } else {
          setFormData(prev => ({ ...prev, email: user.email || prev.email }));
        }
      };
      fetchProfile();
    }
  }, [user]);

  const validateForm = (): boolean => {
    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
      result.error.errors.forEach(err => {
        const field = err.path[0] as keyof CheckoutFormData;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const formatWhatsAppMessage = (orderId: string): string => {
    const itemsList = items.map(item =>
      `• ${item.productName} x${item.quantity}`
    ).join("\n");

    const message = `🍯 *New Order from Ngurdam Pure Honey*

*Order ID:* ${orderId}

*Customer Details:*
Name: ${formData.name}
Phone: ${formData.phone}
Email: ${formData.email}

*Delivery Address:*
${formData.address}

*Order Items:*
${itemsList}

*Total Amount:* ${formatPrice(totalPrice)}

${formData.notes ? `*Notes:* ${formData.notes}` : ""}

I would like to confirm this order and arrange for payment and delivery. Thank you!`;

    return encodeURIComponent(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);
    try {
      const orderItems = items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
      }));

      const { data, error } = await supabase.functions.invoke('create-order', {
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
      if (!data?.success) throw new Error(data?.error || 'Failed to create order');

      const { order } = data;
      const whatsappMessage = formatWhatsAppMessage(order.id);
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

      clearCart();
      toast.success("Order placed successfully!");
      window.open(whatsappUrl, "_blank");

      const confirmUrl = `/order-confirmation?orderId=${order.id}&token=${order.accessToken}`;
      navigate(confirmUrl);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 md:py-12">
        <div className="container max-w-4xl">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <h1 className="font-display text-3xl md:text-4xl font-bold mb-8">
            Complete Your <span className="text-gradient">Order</span>
          </h1>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display">Delivery Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input id="name" placeholder="Your full name" value={formData.name}
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
                      <Input id="email" type="email" placeholder="your@email.com" value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={errors.email ? "border-destructive" : ""} />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Textarea id="address" placeholder="Enter your full delivery address" rows={3}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={errors.address ? "border-destructive" : ""} />
                      {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea id="notes" placeholder="Any special instructions..." rows={2}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className={errors.notes ? "border-destructive" : ""} />
                      {errors.notes && <p className="text-sm text-destructive">{errors.notes}</p>}
                    </div>

                    <Button type="submit" size="lg" className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
                      disabled={isLoading}>
                      {isLoading ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Placing Order...</>
                      ) : (
                        <><MessageCircle className="w-5 h-5 mr-2" /> Place Order via WhatsApp</>
                      )}
                    </Button>

                    <p className="text-sm text-muted-foreground text-center">
                      You'll be redirected to WhatsApp to confirm your order and arrange payment.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="font-display flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5" /> Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex gap-3">
                      <div className="w-12 h-12 bg-secondary/20 rounded-md overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-lg">🍯</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">× {item.quantity}</p>
                        <p className="text-sm font-semibold text-primary">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}

                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Subtotal</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated on WhatsApp</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total</span>
                    <span className="text-xl font-bold text-primary">{formatPrice(totalPrice)}</span>
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
