import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface CustomerInfo {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  notes?: string;
  userId?: string;
}

// Simple in-memory sliding-window rate limit (per edge isolate).
// 5 order attempts per IP per 10 minutes.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const rateLimitStore = new Map<string, number[]>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const hits = (rateLimitStore.get(key) ?? []).filter((t) => t > windowStart);
  if (hits.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(key, hits);
    return false;
  }
  hits.push(now);
  rateLimitStore.set(key, hits);
  // opportunistic cleanup
  if (rateLimitStore.size > 5000) {
    for (const [k, v] of rateLimitStore) {
      const fresh = v.filter((t) => t > windowStart);
      if (fresh.length === 0) rateLimitStore.delete(k);
      else rateLimitStore.set(k, fresh);
    }
  }
  return true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limit by client IP (best-effort; isolates may differ)
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("cf-connecting-ip") ||
      "unknown";
    if (!checkRateLimit(`ip:${ip}`)) {
      return new Response(
        JSON.stringify({ success: false, error: "Too many order attempts. Please try again shortly." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
      );
    }

    const { items, customerInfo }: { items: OrderItem[]; customerInfo: CustomerInfo } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("No items provided");
    }

    if (!customerInfo?.customerName || !customerInfo?.customerEmail || !customerInfo?.shippingAddress) {
      throw new Error("Missing required customer information");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validate prices against DB products
    const productIds = items.map((item) => item.productId);
    const { data: dbProducts, error: productsError } = await supabase
      .from("products")
      .select("id, name, price, stock, is_active")
      .in("id", productIds);

    if (productsError) throw new Error("Failed to validate products");

    const productMap = new Map();
    for (const p of dbProducts || []) {
      productMap.set(p.id, p);
    }

    const validatedItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const dbProduct = productMap.get(item.productId);

      if (!dbProduct) throw new Error(`Product not found: ${item.productName}`);
      if (!dbProduct.is_active) throw new Error(`Product "${dbProduct.name}" is not available`);
      if (item.quantity <= 0 || item.quantity > 100) throw new Error(`Invalid quantity for ${dbProduct.name}`);
      if (dbProduct.stock < item.quantity) throw new Error(`Insufficient stock for ${dbProduct.name}`);

      const verifiedPrice = Number(dbProduct.price);
      calculatedTotal += verifiedPrice * item.quantity;

      validatedItems.push({
        productId: dbProduct.id,
        name: dbProduct.name,
        quantity: item.quantity,
        price: verifiedPrice,
      });
    }

    console.log(`Validated ${validatedItems.length} items`);

    const accessToken = crypto.randomUUID();

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customerInfo.customerName.trim(),
        customer_email: customerInfo.customerEmail.trim().toLowerCase(),
        customer_phone: customerInfo.customerPhone?.trim() || null,
        shipping_address: customerInfo.shippingAddress.trim(),
        notes: customerInfo.notes?.trim() || null,
        items: validatedItems,
        total_amount: calculatedTotal,
        currency: "NGN",
        status: "pending",
        payment_status: "pending",
        user_id: customerInfo.userId || null,
        access_token: accessToken,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Order creation failed");
      throw new Error("Failed to create order");
    }

    // Insert order items
    const orderItemsData = validatedItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.name,
      quantity: item.quantity,
      price: item.price,
    }));

    await supabase.from("order_items").insert(orderItemsData);

    // Decrease stock with optimistic locking
    for (const item of validatedItems) {
      const dbProduct = productMap.get(item.productId);
      const { data: updatedProduct, error: stockError } = await supabase
        .from("products")
        .update({ stock: dbProduct.stock - item.quantity })
        .eq("id", item.productId)
        .gte("stock", item.quantity)
        .select();

      if (stockError || !updatedProduct || updatedProduct.length === 0) {
        console.error("Stock update failed for product");
        throw new Error(`Stock changed for ${item.name}, please retry`);
      }
    }

    console.log("Order created successfully");

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          accessToken,
          totalAmount: calculatedTotal,
          currency: "NGN",
          items: validatedItems,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Order creation error");
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
