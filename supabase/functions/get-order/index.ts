import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");
    const accessToken = url.searchParams.get("token");

    if (!orderId) {
      throw new Error("Order ID is required");
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(orderId)) {
      throw new Error("Invalid order ID format");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Check if user is authenticated
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;

    if (authHeader) {
      const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await supabaseAuth.auth.getUser();
      userId = user?.id || null;
    }

    // Use service role to query orders
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build query
    let query = supabase
      .from("orders")
      .select("id, customer_name, customer_email, customer_phone, shipping_address, items, total_amount, currency, status, payment_status, notes, created_at, updated_at, user_id, access_token")
      .eq("id", orderId);

    const { data: order, error } = await query.maybeSingle();

    if (error) {
      console.error("Order fetch failed");
      throw new Error("Failed to fetch order");
    }

    if (!order) {
      return new Response(
        JSON.stringify({ success: false, error: "Order not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Authorization check:
    // 1. Authenticated user viewing their own order
    // 2. Guest with valid access token
    // 3. Admin users (check role)
    let isAuthorized = false;

    if (userId) {
      // Check if user owns the order
      if (order.user_id === userId) {
        isAuthorized = true;
      } else {
        // Check if user is admin
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .eq("role", "admin")
          .maybeSingle();
        
        if (roleData) {
          isAuthorized = true;
        }
      }
    }

    // Check access token for guest orders (with 90-day expiration)
    if (!isAuthorized && accessToken && order.access_token === accessToken) {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      const daysSinceCreation = (now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation <= 90) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 403 }
      );
    }

    // Remove sensitive data before returning
    const safeOrder = {
      id: order.id,
      customerName: order.customer_name,
      customerEmail: order.customer_email,
      customerPhone: order.customer_phone,
      shippingAddress: order.shipping_address,
      items: order.items,
      totalAmount: order.total_amount,
      currency: order.currency,
      status: order.status,
      paymentStatus: order.payment_status,
      notes: order.notes,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };

    return new Response(
      JSON.stringify({ success: true, order: safeOrder }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("Order fetch error");
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
