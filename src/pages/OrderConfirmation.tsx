import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Package, MessageCircle, Home, Loader2, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface OrderItem {
  productTitle: string;
  variantTitle?: string;
  quantity: number;
  price: number;
  currencyCode: string;
  selectedOptions?: { name: string; value: string }[];
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  items: OrderItem[];
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
  notes?: string;
}

const statusConfig: Record<string, { label: string; color: string; description: string }> = {
  pending: { label: "Pending", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20", description: "We've received your order" },
  confirmed: { label: "Confirmed", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", description: "Your order has been confirmed" },
  processing: { label: "Processing", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", description: "We're preparing your order" },
  shipped: { label: "Shipped", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20", description: "Your order is on its way" },
  delivered: { label: "Delivered", color: "bg-green-500/10 text-green-600 border-green-500/20", description: "Order has been delivered" },
  cancelled: { label: "Cancelled", color: "bg-red-500/10 text-red-600 border-red-500/20", description: "Order was cancelled" },
};

const WHATSAPP_NUMBER = "2348027798163";

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }
    fetchOrder();
  }, [orderId, navigate]);

  const fetchOrder = async () => {
    if (!orderId) return;
    
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setOrder({
          ...data,
          items: typeof data.items === "string" ? JSON.parse(data.items) : data.items,
        });
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Could not load order details");
    } finally {
      setIsLoading(false);
    }
  };

  const copyOrderId = () => {
    if (order) {
      navigator.clipboard.writeText(order.id);
      setCopied(true);
      toast.success("Order ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(`Hi! I'd like to check on my order: ${orderId}`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-12 flex flex-col items-center justify-center">
          <Package className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">We couldn't find this order.</p>
          <Button onClick={() => navigate("/")}>Go to Homepage</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8 md:py-12 max-w-3xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Order Confirmed!
          </h1>
          <p className="text-muted-foreground">
            Thank you for your order, {order.customer_name.split(" ")[0]}!
          </p>
        </div>

        {/* Order ID Card */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Order ID</p>
                <p className="font-mono text-lg font-semibold">{order.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyOrderId}>
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? "Copied" : "Copy ID"}
                </Button>
                <Badge variant="outline" className={status.color}>
                  {status.label}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${order.status === "cancelled" ? "bg-red-500" : "bg-green-500"}`} />
              <div>
                <p className="font-medium">{status.label}</p>
                <p className="text-sm text-muted-foreground">{status.description}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Placed on {format(new Date(order.created_at), "MMMM dd, yyyy 'at' h:mm a")}
            </p>
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-display text-lg">Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{item.productTitle}</p>
                  {item.selectedOptions && (
                    <p className="text-sm text-muted-foreground">
                      {item.selectedOptions.map(o => o.value).join(" • ")}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">
                  {item.currencyCode} {(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            ))}
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-xl text-primary">
                {order.currency} {Number(order.total_amount).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Delivery Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-display text-lg">Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{order.customer_phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{order.customer_email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Delivery Address</p>
              <p className="font-medium">{order.shipping_address}</p>
            </div>
            {order.notes && (
              <div>
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="font-medium">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="font-display text-lg">What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              We'll confirm your order and payment details via WhatsApp. Once confirmed, 
              we'll prepare your order and update you on the delivery timeline.
            </p>
            <Button 
              onClick={openWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Us on WhatsApp
            </Button>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate("/products")}>
            Continue Shopping
          </Button>
          <Button className="flex-1" onClick={() => navigate("/")}>
            <Home className="w-4 h-4 mr-2" />
            Go to Homepage
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
