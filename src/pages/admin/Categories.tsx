import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, FolderTree, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Product, fetchProducts } from "@/lib/products";

interface CategoryInfo {
  name: string;
  description: string;
  productCount: number;
  totalStock: number;
  totalValue: number;
}

const KNOWN_CATEGORIES = ["Raw Honey", "Wildflower", "Acacia", "Clover", "Bulk"] as const;

export default function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  async function load() {
    setIsLoading(true);
    const items = await fetchProducts(200);
    setProducts(items);

    const map = new Map<string, CategoryInfo>();
    items.forEach((p) => {
      const name = p.category || "Uncategorized";
      if (!map.has(name)) {
        map.set(name, { name, description: "", productCount: 0, totalStock: 0, totalValue: 0 });
      }
      const c = map.get(name)!;
      c.productCount += 1;
      c.totalStock += p.stock;
      c.totalValue += p.stock * Number(p.price);
    });
    setCategories(Array.from(map.values()).sort((a, b) => b.productCount - a.productCount));
    setIsLoading(false);
  }

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: "", description: "" }); setDialogOpen(true); };
  const openEdit = (name: string) => { setEditing(name); setForm({ name, description: "" }); setDialogOpen(true); };

  const save = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      if (editing && editing !== form.name) {
        // rename across all products
        const { error } = await supabase
          .from("products")
          .update({ category: form.name.trim() })
          .eq("category", editing);
        if (error) throw error;
        toast.success(`Renamed "${editing}" → "${form.name.trim()}"`);
      } else if (!editing) {
        toast.success(`Category "${form.name.trim()}" ready — assign it on a product.`);
      } else {
        toast.success("No change");
      }
      setDialogOpen(false);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally { setSaving(false); }
  };

  const remove = async (name: string) => {
    if (!confirm(`Remove "${name}" from all products? Products will become uncategorized.`)) return;
    const { error } = await supabase
      .from("products")
      .update({ category: null })
      .eq("category", name);
    if (error) { toast.error("Failed"); return; }
    toast.success(`Category cleared from ${categories.find((c) => c.name === name)?.productCount} product(s)`);
    load();
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-card">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="font-display text-2xl flex items-center gap-2">
              <FolderTree className="w-5 h-5 text-honey-deep" /> Product Categories
            </CardTitle>
            <CardDescription>Organize products into shoppable categories</CardDescription>
          </div>
          <Button variant="honey" onClick={openCreate}>
            <Plus className="w-4 h-4" /> New Category
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-honey-deep" />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No categories yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((c) => (
                <Card key={c.name} className="border-border/60 hover:shadow-lift transition-shadow">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-display text-xl">{c.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.productCount} product{c.productCount !== 1 ? "s" : ""}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{c.totalStock} in stock</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Inventory value: <span className="font-medium text-foreground">₦{c.totalValue.toLocaleString()}</span>
                    </p>
                    <div className="flex gap-2 pt-2 border-t border-border/40">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c.name)}>
                        <Pencil className="w-3.5 h-3.5" /> Rename
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => remove(c.name)} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" /> Clear
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-xl">Suggested categories</CardTitle>
          <CardDescription>Click to start using on products</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {KNOWN_CATEGORIES.map((c) => (
            <Badge key={c} variant="outline" className="px-3 py-1.5 text-sm">{c}</Badge>
          ))}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing ? `Edit "${editing}"` : "New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cname">Name</Label>
              <Input id="cname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Raw Honey" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cdesc">Description (optional)</Label>
              <Textarea id="cdesc" rows={3} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button variant="honey" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
