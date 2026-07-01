import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Eye, Package, Printer, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";

interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  shipping_address: string;
  items: any[];
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string;
  notes: string | null;
  created_at: string;
  archived_at: string | null;
}

interface OrdersTabProps {
  onOrderUpdate: () => void;
}


const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  processing: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  in_transit: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  shipped: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  delivered: "bg-green-500/10 text-green-600 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-600 border-red-500/20"
};

const paymentStatusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  paid: "bg-green-500/10 text-green-600 border-green-500/20",
  failed: "bg-red-500/10 text-red-600 border-red-500/20",
  refunded: "bg-gray-500/10 text-gray-600 border-gray-500/20"
};

const STATUS_FLOW = ["pending", "processing", "in_transit", "delivered"] as const;

export function OrdersTab({ onOrderUpdate }: OrdersTabProps) {
  const { isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [view, setView] = useState<"active" | "archived">("active");


  useEffect(() => {
    fetchOrders();
    supabase.from('products').select('id, stock').lt('stock', 5).then(({ data }) => {
      setLowStockCount(data?.length || 0);
    });
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Parse items from JSONB
      const parsedOrders = (data || []).map(order => ({
        ...order,
        items: typeof order.items === 'string' ? JSON.parse(order.items) : order.items
      }));
      
      setOrders(parsedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`Order status updated to ${status}`);
      fetchOrders();
      onOrderUpdate();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error("Failed to update order");
    } finally {
      setIsUpdating(false);
    }
  };

  const escapeHtml = (str: string): string => {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const printReceipt = (order: Order) => {
    const receiptWindow = window.open('', '_blank', 'width=400,height=600');
    if (!receiptWindow) return;

    const itemsHtml = order.items.map((item: any) => {
      const name = escapeHtml(item.title || item.name || item.productTitle || '');
      const variant = item.variantTitle ? ` (${escapeHtml(item.variantTitle)})` : '';
      return `
      <tr>
        <td style="padding:6px 0;border-bottom:1px solid #eee;">${name}${variant}</td>
        <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:center;">${Number(item.quantity)}</td>
        <td style="padding:6px 0;border-bottom:1px solid #eee;text-align:right;">₦${(Number(item.price) * Number(item.quantity)).toLocaleString()}</td>
      </tr>
    `;
    }).join('');

    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>Receipt - ${order.id.slice(0,8).toUpperCase()}</title></head>
      <body style="font-family:Arial,sans-serif;max-width:380px;margin:0 auto;padding:20px;color:#333;">
        <div style="text-align:center;margin-bottom:20px;">
          <h2 style="margin:0;">Ngurdama Pure Honey</h2>
          <p style="margin:4px 0;color:#666;font-size:13px;">Order Receipt</p>
        </div>
        <hr style="border:none;border-top:2px dashed #ccc;margin:16px 0;">
        <p style="font-size:13px;"><strong>Order ID:</strong> ${escapeHtml(order.id.slice(0,8).toUpperCase())}</p>
        <p style="font-size:13px;"><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-NG', { year:'numeric', month:'long', day:'numeric' })}</p>
        <p style="font-size:13px;"><strong>Status:</strong> ${escapeHtml(order.status)} | <strong>Payment:</strong> ${escapeHtml(order.payment_status)}</p>
        <hr style="border:none;border-top:1px solid #eee;margin:12px 0;">
        <p style="font-size:13px;"><strong>Customer:</strong> ${escapeHtml(order.customer_name)}</p>
        <p style="font-size:13px;"><strong>Email:</strong> ${escapeHtml(order.customer_email)}</p>
        ${order.customer_phone ? `<p style="font-size:13px;"><strong>Phone:</strong> ${escapeHtml(order.customer_phone)}</p>` : ''}
        <p style="font-size:13px;"><strong>Address:</strong> ${escapeHtml(order.shipping_address)}</p>
        ${order.notes ? `<p style="font-size:13px;"><strong>Notes:</strong> ${escapeHtml(order.notes)}</p>` : ''}
        <hr style="border:none;border-top:2px dashed #ccc;margin:16px 0;">
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="border-bottom:2px solid #333;">
              <th style="text-align:left;padding:6px 0;">Item</th>
              <th style="text-align:center;padding:6px 0;">Qty</th>
              <th style="text-align:right;padding:6px 0;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="margin-top:12px;text-align:right;font-size:16px;font-weight:bold;">
          Total: ₦${Number(order.total_amount).toLocaleString()}
        </div>
        <hr style="border:none;border-top:2px dashed #ccc;margin:16px 0;">
        <p style="text-align:center;font-size:12px;color:#999;">Thank you for your purchase!</p>
        <script>window.onload=function(){window.print();}</script>
      </body>
      </html>
    `);
    receiptWindow.document.close();
  };

  const updatePaymentStatus = async (orderId: string, payment_status: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`Payment status updated to ${payment_status}`);
      fetchOrders();
      onOrderUpdate();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error("Failed to update payment status");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No orders yet</h3>
          <p className="text-muted-foreground">Orders will appear here when customers make purchases.</p>
        </CardContent>
      </Card>
    );
  }

  const totalSales = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + Number(o.total_amount), 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Total Sales (Paid)</CardDescription></CardHeader>
          <CardContent><div className="font-display text-2xl font-bold text-primary">₦{totalSales.toLocaleString()}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Pending Orders</CardDescription></CardHeader>
          <CardContent><div className="font-display text-2xl font-bold">{pendingCount}</div></CardContent>
        </Card>
        <Card className={lowStockCount > 0 ? "border-destructive/50" : ""}>
          <CardHeader className="pb-2"><CardDescription>Low-Stock Alerts</CardDescription></CardHeader>
          <CardContent><div className={`font-display text-2xl font-bold ${lowStockCount > 0 ? "text-destructive" : ""}`}>{lowStockCount}</div></CardContent>
        </Card>
      </div>

    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>Manage customer orders and track deliveries</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">
                  {order.id.slice(0, 8)}...
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.customer_name}</div>
                    <div className="text-sm text-muted-foreground">{order.customer_email}</div>
                  </div>
                </TableCell>
                <TableCell>₦{Number(order.total_amount).toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColors[order.status]}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={paymentStatusColors[order.payment_status]}>
                    {order.payment_status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(order.created_at), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Order Details</DialogTitle>
                        <DialogDescription>
                          Order #{order.id.slice(0, 8)}
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-6">
                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Customer</h4>
                            <p>{order.customer_name}</p>
                            <p className="text-muted-foreground">{order.customer_email}</p>
                            {order.customer_phone && (
                              <p className="text-muted-foreground">{order.customer_phone}</p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Shipping Address</h4>
                            <p className="text-muted-foreground">{order.shipping_address}</p>
                          </div>
                        </div>

                        {/* Items */}
                        <div>
                          <h4 className="font-semibold mb-2">Items</h4>
                          <div className="space-y-2">
                            {order.items.map((item: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center p-2 bg-muted rounded-lg">
                                <div>
                                  <span className="font-medium">{item.title || item.name}</span>
                                  <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                                </div>
                                <span>₦{(Number(item.price) * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center mt-4 pt-4 border-t">
                            <span className="font-semibold">Total</span>
                            <span className="font-bold text-lg">₦{Number(order.total_amount).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Print Receipt */}
                        <Button variant="outline" className="w-full" onClick={() => printReceipt(order)}>
                          <Printer className="h-4 w-4 mr-2" />
                          Print Receipt
                        </Button>

                        {/* Status Updates */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-2">Order Status</h4>
                            <Select
                              value={order.status}
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                              disabled={isUpdating}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="in_transit">In Transit</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-2">Payment Status</h4>
                            <Select
                              value={order.payment_status}
                              onValueChange={(value) => updatePaymentStatus(order.id, value)}
                              disabled={isUpdating}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
    </div>
  );
}