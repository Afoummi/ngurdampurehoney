import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileText, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type ReportKind = "orders" | "revenue" | "inventory" | "customers";

function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows
    .map((r) => r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [busy, setBusy] = useState<ReportKind | null>(null);

  const run = async (kind: ReportKind) => {
    setBusy(kind);
    try {
      const fromIso = new Date(from).toISOString();
      const toIso = new Date(new Date(to).getTime() + 86400000).toISOString();

      if (kind === "orders" || kind === "revenue") {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .gte("created_at", fromIso)
          .lt("created_at", toIso)
          .order("created_at", { ascending: false });
        if (error) throw error;
        const rows: string[][] = [["Order ID", "Date", "Customer", "Email", "Phone", "Address", "Total (NGN)", "Status", "Payment"]];
        (data || []).forEach((o) => rows.push([
          o.id, format(new Date(o.created_at), "yyyy-MM-dd HH:mm"),
          o.customer_name, o.customer_email, o.customer_phone || "",
          o.shipping_address, String(o.total_amount), o.status || "", o.payment_status || "",
        ]));
        downloadCSV(`${kind}-${from}-to-${to}.csv`, rows);
        toast.success(`Exported ${(data || []).length} orders`);
      } else if (kind === "inventory") {
        const { data, error } = await supabase.from("products").select("*").order("name");
        if (error) throw error;
        const rows: string[][] = [["Product", "Size", "Category", "Price (NGN)", "Stock", "Active"]];
        (data || []).forEach((p) => rows.push([
          p.name, p.size || "", p.category || "", String(p.price), String(p.stock), p.is_active ? "Yes" : "No",
        ]));
        downloadCSV(`inventory-${today}.csv`, rows);
        toast.success(`Exported ${(data || []).length} products`);
      } else if (kind === "customers") {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .gte("created_at", fromIso)
          .lt("created_at", toIso);
        if (error) throw error;
        const rows: string[][] = [["Name", "Phone", "Address", "Joined"]];
        (data || []).forEach((p) => rows.push([
          p.full_name || "", p.phone || "", p.address || "",
          format(new Date(p.created_at), "yyyy-MM-dd"),
        ]));
        downloadCSV(`customers-${from}-to-${to}.csv`, rows);
        toast.success(`Exported ${(data || []).length} customers`);
      }
    } catch (e) {
      toast.error("Export failed", { description: e instanceof Error ? e.message : "" });
    } finally {
      setBusy(null);
    }
  };

  const reports: { kind: ReportKind; title: string; desc: string }[] = [
    { kind: "orders", title: "Orders Report", desc: "All orders in date range with customer details and totals" },
    { kind: "revenue", title: "Revenue Report", desc: "Order revenue data formatted for accounting reconciliation" },
    { kind: "inventory", title: "Inventory Snapshot", desc: "Current stock and pricing for every product" },
    { kind: "customers", title: "Customer List", desc: "Customers who joined within the date range" },
  ];

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-2xl flex items-center gap-2">
            <Calendar className="w-5 h-5 text-honey-deep" /> Date Range
          </CardTitle>
          <CardDescription>Reports below use this date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="from">From</Label>
              <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} max={to} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} min={from} max={today} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {reports.map((r) => (
          <Card key={r.kind} className="border-border/60 shadow-card hover:shadow-lift transition-shadow">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-honey-cream flex items-center justify-center">
                  <FileText className="w-5 h-5 text-honey-deep" />
                </div>
                <div className="flex-1">
                  <p className="font-display text-xl">{r.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{r.desc}</p>
                </div>
              </div>
              <Button variant="honey" className="w-full" onClick={() => run(r.kind)} disabled={busy !== null}>
                {busy === r.kind ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Download CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
