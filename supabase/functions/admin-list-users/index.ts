import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) throw new Error("Unauthorized");

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: roleRow } = await admin
      .from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) throw new Error("Forbidden: admin only");

    // Fetch auth users (paginated, take first 1000)
    const { data: usersData, error: listErr } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (listErr) throw listErr;

    const { data: profiles } = await admin.from("profiles").select("user_id, full_name, phone, created_at");
    const { data: roles } = await admin.from("user_roles").select("user_id, role");

    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
    const roleMap = new Map<string, string>();
    for (const r of roles || []) {
      const current = roleMap.get(r.user_id);
      // priority: admin > moderator > customer
      const rank = (x: string) => x === "admin" ? 3 : x === "moderator" ? 2 : 1;
      if (!current || rank(r.role) > rank(current)) roleMap.set(r.user_id, r.role);
    }

    const users = usersData.users.map((u) => ({
      id: u.id,
      email: u.email,
      full_name: profileMap.get(u.id)?.full_name ?? null,
      phone: profileMap.get(u.id)?.phone ?? null,
      created_at: u.created_at,
      role: roleMap.get(u.id) ?? "customer",
    }));

    return new Response(JSON.stringify({ success: true, users }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
