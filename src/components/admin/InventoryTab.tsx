import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Save, Package } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, Product } from "@/lib/products";

export function InventoryTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [edits, setEdits] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetch = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("products").select("*").order("price", { ascending: true });
    if (error) {
      toast.error("Failed to load inventory");
    } else {
      setProducts((data as Product[]) || []);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const save = async (id: string) => {
    const newStock = edits[id];
    if (newStock === undefined || newStock < 0) return;
    setSavingId(id);
    const { error } = await supabase.from("products").update({ stock: newStock }).eq("id", id);
    if (error) {
      toast.error("Failed to update stock");
    } else {
      toast.success("Stock updated");
      setProducts((p) => p.map((x) => (x.id === id ? { ...x, stock: newStock } : x)));
      setEdits((e) => { const c = { ...e }; delete c[id]; return c; });
    }
    setSavingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" /> Inventory Management
        </CardTitle>
        <CardDescription>Adjust stock levels for Ngurdam Pure Honey variants.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Update</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => {
              const out = p.stock <= 0;
              const low = !out && p.stock < 5;
              const edit = edits[p.id];
              const changed = edit !== undefined && edit !== p.stock;
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.size || "—"}</TableCell>
                  <TableCell>{formatPrice(Number(p.price))}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        out
                          ? "bg-destructive text-destructive-foreground border-destructive"
                          : low
                          ? "bg-warning/15 text-warning-foreground border-warning/40"
                          : ""
                      }
                    >
                      {p.stock} {out ? "· OUT" : low ? "· LOW" : ""}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      className="w-24"
                      value={edit ?? p.stock}
                      onChange={(e) => setEdits({ ...edits, [p.id]: Math.max(0, parseInt(e.target.value) || 0) })}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      disabled={!changed || savingId === p.id}
                      onClick={() => save(p.id)}
                    >
                      {savingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
