import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import {
  ShoppingCart, DollarSign, Package, Users, Clock, CheckCircle2,
  XCircle, AlertTriangle, ArrowUpRight, ArrowRight,
} from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

interface KPI {
  totalOrders: number;
  revenue: number;
  products: number;
  customers: number;
  pending: number;
  completed: number;
  cancelled: number;
  outOfStock: number;
}

export default function AdminOverview() {
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [monthly, setMonthly] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<{ name: string; value: number }[]>([]);
  const [customerGrowth, setCustomerGrowth] = useState<{ date: string; count: number }[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const [{ data: orders }, { data: products }, { data: profiles }] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*"),
      supabase.from("profiles").select("user_id, created_at"),
    ]);

    const ordersArr = orders || [];
    const productsArr = products || [];
    const profilesArr = profiles || [];

    const paid = ordersArr.filter((o) => o.payment_status === "paid");
    const revenue = paid.reduce((s, o) => s + Number(o.total_amount), 0);

    setKpi({
      totalOrders: ordersArr.length,
      revenue,
      products: productsArr.length,
      customers: profilesArr.length,
      pending: ordersArr.filter((o) => o.status === "pending").length,
      completed: ordersArr.filter((o) => o.status === "delivered").length,
      cancelled: ordersArr.filter((o) => o.status === "cancelled").length,
      outOfStock: productsArr.filter((p) => p.stock <= 0).length,
    });

    // 30-day rolling
    const days = Array.from({ length: 30 }, (_, i) => startOfDay(subDays(new Date(), 29 - i)));
    const dayMap = new Map<string, { revenue: number; orders: number }>();
    days.forEach((d) => dayMap.set(format(d, "yyyy-MM-dd"), { revenue: 0, orders: 0 }));

    ordersArr.forEach((o) => {
      const key = format(new Date(o.created_at), "yyyy-MM-dd");
      const slot = dayMap.get(key);
      if (slot) {
        slot.orders += 1;
        if (o.payment_status === "paid") slot.revenue += Number(o.total_amount);
      }
    });
    setMonthly(Array.from(dayMap.entries()).map(([date, v]) => ({ date: format(new Date(date), "MMM d"), ...v })));

    // Status breakdown
    const statusCounts: Record<string, number> = {};
    ordersArr.forEach((o) => { statusCounts[o.status || "pending"] = (statusCounts[o.status || "pending"] || 0) + 1; });
    setStatusBreakdown(Object.entries(statusCounts).map(([name, value]) => ({ name, value })));

    // Customer growth
    const cMap = new Map<string, number>();
    days.forEach((d) => cMap.set(format(d, "yyyy-MM-dd"), 0));
    let cumulative = 0;
    const sortedProfiles = [...profilesArr].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    days.forEach((d) => {
      const key = format(d, "yyyy-MM-dd");
      cumulative += sortedProfiles.filter((p) => format(new Date(p.created_at), "yyyy-MM-dd") === key).length;
      cMap.set(key, cumulative);
    });
    setCustomerGrowth(Array.from(cMap.entries()).map(([date, count]) => ({ date: format(new Date(date), "MMM d"), count })));

    setRecentOrders(ordersArr.slice(0, 5));
    setLowStock(productsArr.filter((p) => p.stock > 0 && p.stock < 5).slice(0, 5));
  }

  if (!kpi) {
    return <div className="space-y-4 animate-pulse">
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-muted rounded-xl" />)}
      </div>
    </div>;
  }

  const cards = [
    { label: "Total Revenue", value: `₦${kpi.revenue.toLocaleString()}`, icon: DollarSign, color: "text-honey-deep", accent: "bg-honey-cream" },
    { label: "Total Orders", value: kpi.totalOrders, icon: ShoppingCart, color: "text-primary", accent: "bg-primary/10" },
    { label: "Customers", value: kpi.customers, icon: Users, color: "text-success", accent: "bg-success/10" },
    { label: "Products", value: kpi.products, icon: Package, color: "text-foreground", accent: "bg-muted" },
    { label: "Pending Orders", value: kpi.pending, icon: Clock, color: "text-warning", accent: "bg-warning/10" },
    { label: "Completed", value: kpi.completed, icon: CheckCircle2, color: "text-success", accent: "bg-success/10" },
    { label: "Cancelled", value: kpi.cancelled, icon: XCircle, color: "text-destructive", accent: "bg-destructive/10" },
    { label: "Out of Stock", value: kpi.outOfStock, icon: AlertTriangle, color: kpi.outOfStock > 0 ? "text-destructive" : "text-muted-foreground", accent: kpi.outOfStock > 0 ? "bg-destructive/10" : "bg-muted" },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="border-border/60 shadow-card hover:shadow-lift transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{c.label}</p>
                  <p className={`font-display text-3xl mt-2 ${c.color}`}>{c.value}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${c.accent} flex items-center justify-center`}>
                  <c.icon className={`w-5 h-5 ${c.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-xl">Revenue · last 30 days</CardTitle>
            <CardDescription>Paid order revenue in Naira</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--honey))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--honey))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(var(--honey-deep))" fill="url(#rev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-xl">Orders by status</CardTitle>
            <CardDescription>Distribution across order lifecycle</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="value" fill="hsl(var(--honey))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-xl">Orders volume</CardTitle>
            <CardDescription>Order count per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-xl">Customer growth</CardTitle>
            <CardDescription>Cumulative registered customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={customerGrowth}>
                  <defs>
                    <linearGradient id="cust" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--success))" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(var(--success))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Area type="monotone" dataKey="count" stroke="hsl(var(--success))" fill="url(#cust)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders + low stock */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-xl">Recent Orders</CardTitle>
              <CardDescription>Latest customer purchases</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/orders">View all <ArrowRight className="w-3 h-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">No orders yet.</p>
            ) : recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground font-mono">#{o.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <Badge variant="outline" className="capitalize text-xs">{o.status || "pending"}</Badge>
                  <p className="font-display text-base text-honey-deep">₦{Number(o.total_amount).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-warning" /> Low Stock Alert
              </CardTitle>
              <CardDescription>Restock these soon</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/inventory">Manage <ArrowRight className="w-3 h-3 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" /> All products well stocked.
              </p>
            ) : lowStock.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.size}</p>
                </div>
                <Badge variant="destructive">{p.stock} left</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
