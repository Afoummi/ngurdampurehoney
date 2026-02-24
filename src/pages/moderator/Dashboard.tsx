import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, LogOut, Package, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { OrdersTab } from "@/components/admin/OrdersTab";
import { ProductsTab } from "@/components/admin/ProductsTab";

export default function ModeratorDashboard() {
  const { user, isLoading: authLoading, isModerator, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (!authLoading && user && !isModerator && !isAdmin) {
      toast.error("Access denied. Moderator privileges required.");
      navigate("/");
      return;
    }
  }, [user, authLoading, isModerator, isAdmin, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || (!isModerator && !isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-honey-gradient flex items-center justify-center">
              <span className="text-xl">🍯</span>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">Moderator Dashboard</h1>
              <p className="text-sm text-muted-foreground">Ngurdam Pure Honey</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/")}>View Store</Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" /> Orders
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" /> Products
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <OrdersTab onOrderUpdate={() => {}} />
          </TabsContent>

          <TabsContent value="products">
            <ProductsTab canDelete={false} canCreate={false} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
