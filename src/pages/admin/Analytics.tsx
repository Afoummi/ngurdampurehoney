import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";

const PIE_COLORS = ["hsl(var(--honey))", "hsl(var(--honey-deep))", "hsl(var(--primary))", "hsl(var(--success))", "hsl(var(--warning))"];

export default function AnalyticsPage() {
  const [topProducts, setTopProducts] = useState<{ name: string; units: number; revenue: number }[]>([]);
  const [bySize, setBySize] = useState<{ name: string; value: number }[]>([]);
  const [byCategory, setByCategory] = useState<{ name: string; value: number }[]>([]);
  const [aov, setAov] = useState(0);
  const [conversion, setConversion] = useState(0);

  useEffect(() => {
    (async () => {
      const [{ data: orders }, { data: products }] = await Promise.all([
        supabase.from("orders").select("*"),
        supabase.from("products").select("*"),
      ]);

      const ordersArr = orders || [];
      const productsArr = products || [];

      const productMap = new Map<string, { name: string; units: number; revenue: number }>();
      let totalRevenue = 0;
      let paidCount = 0;

      ordersArr.forEach((o) => {
        const items = Array.isArray(o.items) ? o.items : [];
        const isPaid = o.payment_status === "paid";
        if (isPaid) { totalRevenue += Number(o.total_amount); paidCount += 1; }
        items.forEach((it: any) => {
          const key = it.productId || it.title || it.name || "Unknown";
          const name = it.title || it.name || it.productTitle || "Unknown";
          if (!productMap.has(key)) productMap.set(key, { name, units: 0, revenue: 0 });
          const slot = productMap.get(key)!;
          slot.units += Number(it.quantity || 0);
          slot.revenue += Number(it.price || 0) * Number(it.quantity || 0);
        });
      });

      setTopProducts([...productMap.values()].sort((a, b) => b.units - a.units).slice(0, 8));
      setAov(paidCount > 0 ? totalRevenue / paidCount : 0);
      setConversion(ordersArr.length > 0 ? (paidCount / ordersArr.length) * 100 : 0);

      const sizeMap = new Map<string, number>();
      productsArr.forEach((p) => {
        const k = p.size || "Other";
        sizeMap.set(k, (sizeMap.get(k) || 0) + p.stock);
      });
      setBySize([...sizeMap.entries()].map(([name, value]) => ({ name, value })));

      const catMap = new Map<string, number>();
      productsArr.forEach((p) => {
        const k = p.category || "Uncategorized";
        catMap.set(k, (catMap.get(k) || 0) + 1);
      });
      setByCategory([...catMap.entries()].map(([name, value]) => ({ name, value })));
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/60 shadow-card">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Avg Order Value</p>
            <p className="font-display text-3xl mt-2 text-honey-deep">₦{Math.round(aov).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-card">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Conversion Rate</p>
            <p className="font-display text-3xl mt-2">{conversion.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1">Paid / Total orders</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-card">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Active Products</p>
            <p className="font-display text-3xl mt-2">{byCategory.reduce((s, c) => s + c.value, 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-card">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Categories</p>
            <p className="font-display text-3xl mt-2">{byCategory.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-xl">Top selling products</CardTitle>
          <CardDescription>By units sold across all orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={80} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                <Bar dataKey="units" fill="hsl(var(--honey))" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-xl">Inventory by size</CardTitle>
            <CardDescription>Units in stock per packaging size</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={bySize} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {bySize.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-card">
          <CardHeader>
            <CardTitle className="font-display text-xl">Products by category</CardTitle>
            <CardDescription>How products are organized</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {byCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
