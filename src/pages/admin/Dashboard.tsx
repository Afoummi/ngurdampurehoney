import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogOut, Package, Users, ShoppingCart, Settings, Bell } from "lucide-react";
import { toast } from "sonner";
import { OrdersTab } from "@/components/admin/OrdersTab";
import { CustomersTab } from "@/components/admin/CustomersTab";
import { SettingsTab } from "@/components/admin/SettingsTab";
import { ProductsTab } from "@/components/admin/ProductsTab";

interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalCustomers: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    pendingOrders: 0,
    totalCustomers: 0,
    totalRevenue: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [newOrderCount, setNewOrderCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }
    
    if (!authLoading && user && !isAdmin) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
      return;
    }
  }, [user, authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      
      // Subscribe to realtime order updates
      const channel = supabase
        .channel('admin-orders')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'orders'
          },
          (payload) => {
            console.log('New order received:', payload);
            setNewOrderCount(prev => prev + 1);
            toast.success("New order received!", {
              description: `Order from ${(payload.new as any).customer_name}`,
              duration: 10000
            });
            fetchStats();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*');

      if (ordersError) throw ordersError;

      // Fetch customers (profiles)
      const { data: customers, error: customersError } = await supabase
        .from('profiles')
        .select('*');

      if (customersError) throw customersError;

      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const pendingOrders = orders?.filter(o => o.status === 'pending').length || 0;

      setStats({
        totalOrders: orders?.length || 0,
        pendingOrders,
        totalCustomers: customers?.length || 0,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-honey-gradient flex items-center justify-center">
              <span className="text-xl">🍯</span>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">AB Sardauna</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {newOrderCount > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setNewOrderCount(0)}
                className="relative"
              >
                <Bell className="h-4 w-4 mr-2" />
                {newOrderCount} new order{newOrderCount > 1 ? 's' : ''}
              </Button>
            )}
            <Button variant="ghost" onClick={() => navigate("/")}>
              View Store
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingStats ? "-" : stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingOrders} pending
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isLoadingStats ? "-" : stats.totalCustomers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoadingStats ? "-" : `₦${stats.totalRevenue.toLocaleString()}`}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{isLoadingStats ? "-" : stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">Awaiting action</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="customers" className="gap-2">
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders">
            <OrdersTab onOrderUpdate={fetchStats} />
          </TabsContent>
          
          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>
          
          <TabsContent value="customers">
            <CustomersTab />
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}