import { supabase } from "@/integrations/supabase/client";

export type AuditAction =
  | "login"
  | "login_failed"
  | "logout"
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "order_status_changed"
  | "order_archived"
  | "order_restored"
  | "order_deleted"
  | "role_changed"
  | "user_deleted"
  | "settings_changed"
  | "media_uploaded"
  | "media_deleted"
  | "media_updated";

interface AuditPayload {
  action: AuditAction;
  resourceType?: string;
  resourceId?: string | null;
  details?: Record<string, unknown>;
}

let cachedIp: string | null | undefined;

async function resolveIp(): Promise<string | null> {
  if (cachedIp !== undefined) return cachedIp;
  try {
    const res = await fetch("https://api.ipify.org?format=json", { cache: "force-cache" });
    const json = (await res.json()) as { ip?: string };
    cachedIp = json.ip ?? null;
  } catch {
    cachedIp = null;
  }
  return cachedIp;
}

/**
 * Append an entry to the admin-only audit trail.
 * Never throws — auditing must not break the user-facing action.
 * The table is append-only (no update/delete policies) and readable by admins only.
 */
export async function logAudit({ action, resourceType, resourceId, details }: AuditPayload) {
  try {
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return; // anonymous events are not attributable; RLS requires user_id = auth.uid()

    const [{ data: roles }, ip] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", user.id),
      resolveIp(),
    ]);

    const roleList = (roles ?? []).map((r) => r.role as string);
    const actorRole = roleList.includes("admin")
      ? "admin"
      : roleList.includes("moderator")
        ? "moderator"
        : "customer";

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      actor_email: user.email ?? null,
      actor_role: actorRole,
      action,
      resource_type: resourceType ?? null,
      resource_id: resourceId ? String(resourceId) : null,
      details: (details ?? null) as never,
      ip_address: ip,
      user_agent: navigator.userAgent.slice(0, 400),
    });
  } catch {
    // swallow: auditing is best-effort
  }
}
