import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SHOPIFY_API_VERSION = "2025-07";
const SHOPIFY_STORE_DOMAIN = "lovable-project-w35b3.myshopify.com";
const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;

interface OrderItem {
  variantId: string;
  quantity: number;
  selectedOptions?: Array<{ name: string; value: string }>;
}

interface CustomerInfo {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  notes?: string;
  userId?: string;
}

// Fetch product variant prices from Shopify to verify
async function fetchVariantPrices(variantIds: string[], storefrontToken: string) {
  const nodeIds = variantIds.map((id) => `"${id}"`).join(", ");
  
  const query = `
    query GetVariants {
      nodes(ids: [${nodeIds}]) {
        ... on ProductVariant {
          id
          title
          price {
            amount
            currencyCode
          }
          availableForSale
          product {
            id
            title
          }
        }
      }
    }
  `;

  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontToken,
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.errors) {
    throw new Error(`Shopify GraphQL error: ${data.errors.map((e: { message: string }) => e.message).join(", ")}`);
  }

  return data.data.nodes;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { items, customerInfo }: { items: OrderItem[]; customerInfo: CustomerInfo } = await req.json();

    // Validate input
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("No items provided");
    }

    if (!customerInfo?.customerName || !customerInfo?.customerEmail || !customerInfo?.shippingAddress) {
      throw new Error("Missing required customer information");
    }

    // Get Shopify token from environment
    const storefrontToken = Deno.env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN");
    if (!storefrontToken) {
      throw new Error("Shopify configuration error");
    }

    console.log("Fetching variant prices from Shopify for validation...");
    
    // Fetch actual prices from Shopify
    const variantIds = items.map((item) => item.variantId);
    const shopifyVariants = await fetchVariantPrices(variantIds, storefrontToken);

    // Create a map of variant ID to Shopify data
    const variantMap = new Map();
    for (const variant of shopifyVariants) {
      if (variant) {
        variantMap.set(variant.id, variant);
      }
    }

    // Validate and build order items with server-verified prices
    const validatedItems = [];
    let calculatedTotal = 0;
    let currencyCode = "NGN";

    for (const item of items) {
      const shopifyVariant = variantMap.get(item.variantId);
      
      if (!shopifyVariant) {
        throw new Error(`Product variant ${item.variantId} not found`);
      }

      if (!shopifyVariant.availableForSale) {
        throw new Error(`Product "${shopifyVariant.product?.title}" is not available for sale`);
      }

      if (item.quantity <= 0 || item.quantity > 100) {
        throw new Error(`Invalid quantity for ${shopifyVariant.product?.title}`);
      }

      const verifiedPrice = parseFloat(shopifyVariant.price.amount);
      currencyCode = shopifyVariant.price.currencyCode;
      calculatedTotal += verifiedPrice * item.quantity;

      validatedItems.push({
        productId: shopifyVariant.product?.id,
        productTitle: shopifyVariant.product?.title,
        variantId: shopifyVariant.id,
        variantTitle: shopifyVariant.title,
        quantity: item.quantity,
        price: verifiedPrice,
        currencyCode: shopifyVariant.price.currencyCode,
        selectedOptions: item.selectedOptions || [],
      });
    }

    console.log(`Validated ${validatedItems.length} items with total: ${calculatedTotal} ${currencyCode}`);

    // Generate secure access token for guest order tracking
    const accessToken = crypto.randomUUID();

    // Create Supabase client with service role for insert
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert order with server-validated data
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        customer_name: customerInfo.customerName.trim(),
        customer_email: customerInfo.customerEmail.trim().toLowerCase(),
        customer_phone: customerInfo.customerPhone?.trim() || null,
        shipping_address: customerInfo.shippingAddress.trim(),
        notes: customerInfo.notes?.trim() || null,
        items: validatedItems,
        total_amount: calculatedTotal,
        currency: currencyCode,
        status: "pending",
        payment_status: "pending",
        user_id: customerInfo.userId || null,
        access_token: accessToken,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw new Error("Failed to create order");
    }

    console.log(`Order created successfully: ${order.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          accessToken: accessToken,
          totalAmount: calculatedTotal,
          currency: currencyCode,
          items: validatedItems,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
