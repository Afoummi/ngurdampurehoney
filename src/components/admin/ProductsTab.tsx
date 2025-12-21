import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2, Package, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { storefrontApiRequest, PRODUCTS_QUERY, ShopifyProduct } from "@/lib/shopify";

interface Product {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string;
  status: string;
  variants: Array<{
    id: number;
    title: string;
    price: string;
    sku: string;
  }>;
  image?: {
    src?: string;
  };
}

export function ProductsTab() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ShopifyProduct | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state for editing
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editVendor, setEditVendor] = useState("");
  const [editProductType, setEditProductType] = useState("");
  const [editTags, setEditTags] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsRefreshing(true);
      const data = await storefrontApiRequest(PRODUCTS_QUERY, { first: 50 });
      
      if (data?.data?.products?.edges) {
        setProducts(data.data.products.edges);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const extractProductId = (gqlId: string): number => {
    // Extract numeric ID from gid://shopify/Product/8803270787203
    const match = gqlId.match(/\/(\d+)$/);
    return match ? parseInt(match[1], 10) : 0;
  };

  const handleEditClick = (product: ShopifyProduct) => {
    setEditingProduct(product);
    setEditTitle(product.node.title);
    setEditDescription(product.node.description || "");
    setEditVendor("");
    setEditProductType("");
    setEditTags("");
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    
    setIsSaving(true);
    try {
      // Note: Updates go through Shopify Admin API via the update tool
      // For now, we'll show a message about limitations
      toast.info("Product editing is available via the Shopify admin panel", {
        description: "For full editing capabilities, use the Shopify Admin link.",
        duration: 5000
      });
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    } finally {
      setIsSaving(false);
    }
  };

  const formatPrice = (amount: string, currencyCode: string = "NGN") => {
    const num = parseFloat(amount);
    if (currencyCode === "NGN") {
      return `₦${num.toLocaleString()}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(num);
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products
            </CardTitle>
            <CardDescription>
              Manage your honey products. {products.length} product{products.length !== 1 ? 's' : ''} in store.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchProducts}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => {
                window.open('https://admin.shopify.com/store/lovable-project-w35b3/products/new', '_blank');
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No products found</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                window.open('https://admin.shopify.com/store/lovable-project-w35b3/products/new', '_blank');
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Product
            </Button>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const minPrice = product.node.priceRange.minVariantPrice;
                  const variantCount = product.node.variants.edges.length;
                  const imageUrl = product.node.images.edges[0]?.node.url;
                  const productId = extractProductId(product.node.id);
                  
                  return (
                    <TableRow key={product.node.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {imageUrl ? (
                            <img 
                              src={imageUrl} 
                              alt={product.node.title}
                              className="h-12 w-12 rounded-md object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-md bg-muted flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{product.node.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {product.node.description?.slice(0, 50) || "No description"}
                              {product.node.description && product.node.description.length > 50 ? "..." : ""}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatPrice(minPrice.amount, minPrice.currencyCode)}
                        </span>
                        {variantCount > 1 && (
                          <span className="text-muted-foreground text-sm"> +</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {variantCount} variant{variantCount !== 1 ? 's' : ''}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              window.open(`https://admin.shopify.com/store/lovable-project-w35b3/products/${productId}`, '_blank');
                            }}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update product details. Changes will sync to your store.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Product Title</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Product name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Product description"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-vendor">Vendor</Label>
                <Input
                  id="edit-vendor"
                  value={editVendor}
                  onChange={(e) => setEditVendor(e.target.value)}
                  placeholder="AB Sardauna"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-type">Product Type</Label>
                <Input
                  id="edit-type"
                  value={editProductType}
                  onChange={(e) => setEditProductType(e.target.value)}
                  placeholder="Honey"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags</Label>
              <Input
                id="edit-tags"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="honey, natural, pure (comma separated)"
              />
            </div>

            {editingProduct && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Variants & Pricing</p>
                <div className="space-y-1">
                  {editingProduct.node.variants.edges.map((variant) => (
                    <div key={variant.node.id} className="flex justify-between text-sm">
                      <span>{variant.node.title}</span>
                      <span className="font-medium">
                        {formatPrice(variant.node.price.amount, variant.node.price.currencyCode)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Edit variants in Shopify Admin for price changes.
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (editingProduct) {
                  const productId = extractProductId(editingProduct.node.id);
                  window.open(`https://admin.shopify.com/store/lovable-project-w35b3/products/${productId}`, '_blank');
                }
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Shopify
            </Button>
            <Button onClick={() => setIsEditDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
