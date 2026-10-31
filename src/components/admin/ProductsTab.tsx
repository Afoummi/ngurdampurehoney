import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, Package, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Product, formatPrice, CONTAINER_TYPES, PACKAGE_SIZES } from "@/lib/products";
import { ImageUploader } from "./ImageUploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { logAudit } from "@/lib/audit";


interface ProductsTabProps {
  canDelete?: boolean;
  canCreate?: boolean;
}

export function ProductsTab({ canDelete = true, canCreate = true }: ProductsTabProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [form, setForm] = useState({
    name: "", description: "", price: "", stock: "", image_url: "", category: "",
    container_type: "", container_type_custom: "",
    package_size: "", package_size_custom: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data as Product[]) || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    setForm({
      name: "", description: "", price: "", stock: "", image_url: "", category: "",
      container_type: "", container_type_custom: "",
      package_size: "", package_size_custom: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    const ct = product.container_type || "";
    const ps = product.package_size || "";
    setForm({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      stock: String(product.stock),
      image_url: product.image_url || "",
      category: product.category || "",
      container_type: ct && (CONTAINER_TYPES as readonly string[]).includes(ct) ? ct : ct ? "__custom__" : "",
      container_type_custom: ct && !(CONTAINER_TYPES as readonly string[]).includes(ct) ? ct : "",
      package_size: ps && (PACKAGE_SIZES as readonly string[]).includes(ps) ? ps : ps ? "__custom__" : "",
      package_size_custom: ps && !(PACKAGE_SIZES as readonly string[]).includes(ps) ? ps : "",
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) {
      toast.error("Name and price are required");
      return;
    }

    setIsSaving(true);
    try {
      const containerType =
        form.container_type === "__custom__"
          ? form.container_type_custom.trim()
          : form.container_type.trim();
      const packageSize =
        form.package_size === "__custom__"
          ? form.package_size_custom.trim()
          : form.package_size.trim();

      const productData = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        price: parseFloat(form.price),
        stock: parseInt(form.stock) || 0,
        image_url: form.image_url.trim() || null,
        category: form.category.trim() || null,
        container_type: containerType || null,
        package_size: packageSize || null,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
        if (error) throw error;
        void logAudit({ action: "product_updated", resourceType: "product", resourceId: editingProduct.id, details: { name: productData.name, price: productData.price, stock: productData.stock } });
        toast.success("Product updated");
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);
        if (error) throw error;
        void logAudit({ action: "product_created", resourceType: "product", details: { name: productData.name, price: productData.price, stock: productData.stock } });
        toast.success("Product created");
      }

      setIsDialogOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      void logAudit({ action: "product_deleted", resourceType: "product", resourceId: id });
      toast.success("Product deleted");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  const toggleActive = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);
      if (error) throw error;
      void logAudit({ action: "product_updated", resourceType: "product", resourceId: product.id, details: { is_active: !product.is_active } });
      toast.success(product.is_active ? "Product deactivated" : "Product activated");
      fetchProducts();
    } catch (error) {
      toast.error("Failed to update product");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" /> Products
              </CardTitle>
              <CardDescription>
                {products.length} product{products.length !== 1 ? 's' : ''} in store.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchProducts}>
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
              {canCreate && (
                <Button size="sm" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" /> Add Product
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products found</p>
              {canCreate && (
                <Button variant="outline" className="mt-4" onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" /> Add Your First Product
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Packaging</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.image_url ? (
                            <ResolvedImage image={product.image_url} alt={product.name}
                              className="h-12 w-12 rounded-md object-cover" />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {product.description?.slice(0, 50) || "No description"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          {product.container_type && (
                            <Badge variant="outline" className="w-fit font-normal">
                              {product.container_type}
                            </Badge>
                          )}
                          {product.package_size && (
                            <span className="text-muted-foreground">{product.package_size}</span>
                          )}
                          {!product.container_type && !product.package_size && (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{formatPrice(product.price)}</TableCell>
                      <TableCell>
                        <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
                          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={product.is_active
                            ? "bg-green-500/10 text-green-600 cursor-pointer"
                            : "bg-red-500/10 text-red-600 cursor-pointer"}
                          onClick={() => toggleActive(product)}
                        >
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {canDelete && (
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg w-[calc(100vw-2rem)] max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>
              {editingProduct ? "Update product details." : "Create a new product."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Product Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Raw Honey 500g" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Product description" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Price (₦) *</Label>
                <Input type="number" value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="5000" min="0" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input type="number" value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  placeholder="100" min="0" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Container Type</Label>
                <Select
                  value={form.container_type || "__none__"}
                  onValueChange={(v) =>
                    setForm({ ...form, container_type: v === "__none__" ? "" : v })
                  }
                >
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {CONTAINER_TYPES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                    <SelectItem value="__custom__">Custom…</SelectItem>
                  </SelectContent>
                </Select>
                {form.container_type === "__custom__" && (
                  <Input
                    value={form.container_type_custom}
                    onChange={(e) => setForm({ ...form, container_type_custom: e.target.value })}
                    placeholder="e.g. Reusable Tin"
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label>Package Size</Label>
                <Select
                  value={form.package_size || "__none__"}
                  onValueChange={(v) =>
                    setForm({ ...form, package_size: v === "__none__" ? "" : v })
                  }
                >
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {PACKAGE_SIZES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                    <SelectItem value="__custom__">Custom…</SelectItem>
                  </SelectContent>
                </Select>
                {form.package_size === "__custom__" && (
                  <Input
                    value={form.package_size_custom}
                    onChange={(e) => setForm({ ...form, package_size_custom: e.target.value })}
                    placeholder="e.g. 750 ml"
                  />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Product Image</Label>
              <ImageUploader
                value={form.image_url || null}
                onChange={(url) => setForm({ ...form, image_url: url ?? "" })}
                folder="products"
                aspect="square"
                label="Product image"
              />
            </div>

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
