import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

interface Order {
  id: string;
  items: any[];
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  processing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  shipped: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  delivered: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20"
};

export default function CustomerOrders() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (user) {
      fetchOrders();
    }
  }, [user, authLoading, navigate]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const parsedOrders = (data || []).map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      }));

      setOrders(parsedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shop
        </Button>

        <h1 className="font-display text-3xl font-bold mb-8">My Orders</h1>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No orders yet</h3>
              <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
              <Button onClick={() => navigate("/products")}>
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                      <CardDescription>
                        {format(new Date(order.created_at), 'MMMM dd, yyyy')}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={statusColors[order.status]}>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span>
                          {item.title || item.name} x{item.quantity}
                        </span>
                        <span className="text-muted-foreground">
                          ₦{(Number(item.price) * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center pt-4 border-t mt-4">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold">₦{Number(order.total_amount).toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}