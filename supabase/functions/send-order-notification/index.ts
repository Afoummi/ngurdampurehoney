import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OrderNotificationRequest {
  orderDetails: {
    id: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    shippingAddress: string;
    items: Array<{
      title: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
    currency: string;
  };
  adminEmail: string;
}

const sendEmail = async (to: string, subject: string, html: string) => {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "AB Sardauna <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return response.json();
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-order-notification function called");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { orderDetails, adminEmail }: OrderNotificationRequest = await req.json();
    console.log("Processing order notification for order:", orderDetails.id);

    const esc = (v: unknown): string =>
      String(v ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

    const itemsHtml = orderDetails.items
      .map(item => `<tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${esc(item.title)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${esc(item.quantity)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₦${(Number(item.price) * Number(item.quantity)).toLocaleString()}</td>
      </tr>`)
      .join("");


    // Send notification to admin
    const adminEmailResponse = await sendEmail(
      adminEmail,
      `🍯 New Order - ${orderDetails.customerName}`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #D97706, #F59E0B); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">New Order Received! 🎉</h1>
          </div>
          
          <div style="padding: 20px; background: #fff;">
            <h2 style="color: #333;">Order #${orderDetails.id.slice(0, 8)}</h2>
            
            <h3 style="color: #666; border-bottom: 2px solid #D97706; padding-bottom: 10px;">Customer Details</h3>
            <p><strong>Name:</strong> ${orderDetails.customerName}</p>
            <p><strong>Email:</strong> ${orderDetails.customerEmail}</p>
            ${orderDetails.customerPhone ? `<p><strong>Phone:</strong> ${orderDetails.customerPhone}</p>` : ''}
            <p><strong>Shipping Address:</strong> ${orderDetails.shippingAddress}</p>
            
            <h3 style="color: #666; border-bottom: 2px solid #D97706; padding-bottom: 10px; margin-top: 20px;">Order Items</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 10px; text-align: left;">Item</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 15px; font-weight: bold; text-align: right;">Total:</td>
                  <td style="padding: 15px; font-weight: bold; text-align: right; color: #D97706;">₦${orderDetails.totalAmount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
            
            <p style="margin-top: 20px; padding: 15px; background: #FEF3C7; border-radius: 8px;">
              Please process this order as soon as possible. The customer is waiting!
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 15px; text-align: center;">
            <p style="margin: 0;">AB Sardauna - Ngurdam Pure Honey</p>
          </div>
        </div>
      `
    );

    console.log("Admin email sent successfully");

    // Send confirmation to customer
    const customerEmailResponse = await sendEmail(
      orderDetails.customerEmail,
      `Order Confirmed - AB Sardauna 🍯`,
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #D97706, #F59E0B); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Thank You for Your Order! 🍯</h1>
          </div>
          
          <div style="padding: 20px; background: #fff;">
            <p>Dear ${orderDetails.customerName},</p>
            <p>We've received your order and are getting it ready for you!</p>
            
            <h3 style="color: #666; border-bottom: 2px solid #D97706; padding-bottom: 10px;">Order Summary</h3>
            <p><strong>Order ID:</strong> #${orderDetails.id.slice(0, 8)}</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="background: #f5f5f5;">
                  <th style="padding: 10px; text-align: left;">Item</th>
                  <th style="padding: 10px; text-align: center;">Qty</th>
                  <th style="padding: 10px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 15px; font-weight: bold; text-align: right;">Total:</td>
                  <td style="padding: 15px; font-weight: bold; text-align: right; color: #D97706;">₦${orderDetails.totalAmount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
            
            <h3 style="color: #666; border-bottom: 2px solid #D97706; padding-bottom: 10px;">Shipping Address</h3>
            <p>${orderDetails.shippingAddress}</p>
            
            <p style="margin-top: 20px; padding: 15px; background: #D1FAE5; border-radius: 8px;">
              We'll notify you when your order has been shipped. Thank you for choosing Ngurdam Pure Honey!
            </p>
          </div>
          
          <div style="background: #333; color: white; padding: 15px; text-align: center;">
            <p style="margin: 0;">AB Sardauna - Ngurdam Pure Honey</p>
            <p style="margin: 5px 0 0 0; font-size: 12px;">Premium, 100% natural honey</p>
          </div>
        </div>
      `
    );

    console.log("Customer email sent successfully");

    return new Response(
      JSON.stringify({ 
        success: true, 
        adminEmail: adminEmailResponse,
        customerEmail: customerEmailResponse 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Notification sending failed");
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);