import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Package, Search, Loader2, ArrowLeft, MessageCircle, CheckCircle2, Clock, Truck, MapPin } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useSiteSettings } from "@/hooks/useSiteSettings";

interface OrderItem {
  productTitle: string;
  quantity: number;
  price: number;
  currencyCode: string;
  selectedOptions?: { name: string; value: string }[];
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  shippingAddress: string;
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: MapPin },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  processing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  shipped: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  delivered: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  paid: "bg-green-500/10 text-green-600 border-green-500/20",
  failed: "bg-red-500/10 text-red-600 border-red-500/20",
  refunded: "bg-gray-500/10 text-gray-600 border-gray-500/20",
};



export default function TrackOrder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";
  const initialToken = searchParams.get("token") || "";
  
  const [orderId, setOrderId] = useState(initialOrderId);
  const [accessToken, setAccessToken] = useState(initialToken);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const { business } = useSiteSettings();

  // Auto-search if orderId is in URL
  useEffect(() => {
    if (initialOrderId) {
      handleSearch();
    }
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!orderId.trim()) {
      toast.error("Please enter an order ID");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      // Use secure edge function with optional access token
      const { data, error } = await supabase.functions.invoke('get-order', {
        body: null,
        headers: {},
      });

      // Build URL with query params for GET-style request
      const queryParams = new URLSearchParams({ orderId: orderId.trim() });
      if (accessToken) {
        queryParams.set('token', accessToken);
      }

      const response = await supabase.functions.invoke('get-order', {
        method: 'GET',
      });

      // Fallback: call with fetch directly since invoke doesn't support query params well
      const session = await supabase.auth.getSession();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (session.data.session?.access_token) {
        headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
      }

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-order?orderId=${encodeURIComponent(orderId.trim())}${accessToken ? `&token=${encodeURIComponent(accessToken)}` : ''}`;
      
      const res = await fetch(functionUrl, {
        method: 'GET',
        headers,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        if (res.status === 403) {
          toast.error("You don't have permission to view this order");
        } else if (res.status === 404) {
          setOrder(null);
        } else {
          throw new Error(result.error || 'Failed to fetch order');
        }
        return;
      }

      setOrder(result.order);
    } catch (error) {
      console.error("Error fetching order:", error);
      setOrder(null);
      toast.error("Could not find order");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    return statusSteps.findIndex(s => s.key === status);
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(`Hi! I'd like to check on my order: ${order?.id}`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8 md:py-12 max-w-3xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shop
        </Button>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Track Your <span className="text-gradient">Order</span>
          </h1>
          <p className="text-muted-foreground">
            Enter your order ID to see the current status
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Label htmlFor="orderId" className="sr-only">Order ID</Label>
                  <Input
                    id="orderId"
                    placeholder="Enter your order ID"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="h-12"
                  />
                </div>
                <Button type="submit" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Track
                    </>
                  )}
                </Button>
              </div>
              <div>
                <Label htmlFor="accessToken" className="text-sm text-muted-foreground">
                  Access Token (for guest orders)
                </Label>
                <Input
                  id="accessToken"
                  placeholder="Enter access token if provided"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="mt-1"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Order Not Found */}
        {hasSearched && !order && !isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Order Not Found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find an order with that ID. Please check and try again, or provide your access token.
              </p>
              <Button variant="outline" onClick={openWhatsApp}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Header */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <CardTitle className="font-display text-xl">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </CardTitle>
                    <CardDescription>
                      Placed on {format(new Date(order.createdAt), "MMMM dd, yyyy")}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className={statusColors[order.status]}>
                      {order.status}
                    </Badge>
                    <Badge variant="outline" className={paymentStatusColors[order.paymentStatus]}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Status Timeline */}
            {order.status !== "cancelled" && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Order Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />
                    <div 
                      className="absolute left-4 top-0 w-0.5 bg-primary transition-all duration-500"
                      style={{ height: `${(getStatusIndex(order.status) / (statusSteps.length - 1)) * 100}%` }}
                    />
                    
                    {/* Steps */}
                    <div className="space-y-6">
                      {statusSteps.map((step, idx) => {
                        const isCompleted = idx <= getStatusIndex(order.status);
                        const isCurrent = idx === getStatusIndex(order.status);
                        const Icon = step.icon;
                        
                        return (
                          <div key={step.key} className="flex items-center gap-4 relative">
                            <div className={`
                              w-8 h-8 rounded-full flex items-center justify-center z-10
                              ${isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                              ${isCurrent ? "ring-4 ring-primary/20" : ""}
                            `}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <p className={`font-medium ${isCompleted ? "" : "text-muted-foreground"}`}>
                                {step.label}
                              </p>
                              {isCurrent && (
                                <p className="text-sm text-muted-foreground">Current status</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cancelled Status */}
            {order.status === "cancelled" && (
              <Card className="border-destructive/50">
                <CardContent className="py-6">
                  <div className="flex items-center gap-4 text-destructive">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Order Cancelled</p>
                      <p className="text-sm text-muted-foreground">
                        This order has been cancelled. Contact us for more information.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Items */}
            <Card>
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
                    {order.currency} {Number(order.totalAmount).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Delivery Address</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.shippingAddress}</p>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">Need help with your order?</p>
                    <p className="text-sm text-muted-foreground">
                      Contact us on WhatsApp for quick assistance
                    </p>
                  </div>
                  <Button onClick={openWhatsApp} className="bg-[#25D366] hover:bg-[#128C7E] text-white">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Us
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
