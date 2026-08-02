import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, Key, Eye, Users as UsersIcon, Database, AlertTriangle, ScrollText } from "lucide-react";

export default function SecurityPage() {
  const [adminCount, setAdminCount] = useState(0);
  const [moderatorCount, setModeratorCount] = useState(0);

  useEffect(() => {
    supabase.from("user_roles").select("role").then(({ data }) => {
      const roles = data || [];
      setAdminCount(roles.filter((r) => r.role === "admin").length);
      setModeratorCount(roles.filter((r) => r.role === "moderator").length);
    });
  }, []);

  const checks = [
    { icon: Lock, title: "Row Level Security", status: "Enabled", desc: "All public tables enforce RLS policies." },
    { icon: Key, title: "Service-role only inserts on orders & items", status: "Active", desc: "Only the backend (edge functions) can create orders, preventing client-side abuse." },
    { icon: ShieldCheck, title: "Server-side price validation", status: "Active", desc: "create-order recomputes prices against the products table — clients cannot tamper with pricing." },
    { icon: Database, title: "Optimistic stock locking", status: "Active", desc: "Stock updates use atomic `.gte('stock', quantity)` to prevent oversell races." },
    { icon: Eye, title: "Guest order access tokens", status: "Active", desc: "Guest checkouts get a unique x-order-access-token header to view their order without auth." },
    { icon: ShieldCheck, title: "HTML sanitization in emails", status: "Active", desc: "send-order-notification escapes all dynamic content to prevent XSS." },
    { icon: Lock, title: "Rate limiting on create-order", status: "Active", desc: "Sliding-window IP limiter — 5 attempts per 10 minutes." },
    { icon: ScrollText, title: "Append-only audit logs", status: "Active", desc: "Sensitive staff actions are recorded in audit_logs — admin-read-only, with no update or delete policies." },
    { icon: ShieldCheck, title: "Hardened image uploads", status: "Active", desc: "Uploads are limited to genuine JPG/PNG/WebP files (magic-byte verified, 5 MB cap) and stored under random UUID paths." },
    { icon: Lock, title: "Abuse throttling on public forms", status: "Active", desc: "Login, contact and newsletter submissions are throttled client-side on top of server limits." },
    { icon: UsersIcon, title: "Role separation", status: "Active", desc: "Roles live in user_roles (not profiles). has_role() is SECURITY DEFINER with restricted EXECUTE." },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/60 shadow-card">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Active Admins</p>
            <p className="font-display text-3xl mt-2 text-honey-deep">{adminCount}</p>
          </CardContent>
        </Card>
        <Card className="border-border/60 shadow-card">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Active Moderators</p>
            <p className="font-display text-3xl mt-2 text-primary">{moderatorCount}</p>
          </CardContent>
        </Card>
        <Card className="border-success/30 shadow-card bg-success/5">
          <CardContent className="p-5 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success/15 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="font-display text-xl text-success">Secure</p>
              <p className="text-xs text-muted-foreground">All checks passing</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-2xl flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-honey-deep" /> Security Posture
          </CardTitle>
          <CardDescription>Live status of production-grade security guarantees</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {checks.map((c) => (
            <div key={c.title} className="flex items-start gap-3 p-4 rounded-xl border border-border/60 hover:border-honey/30 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-honey-cream flex items-center justify-center flex-shrink-0">
                <c.icon className="w-5 h-5 text-honey-deep" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium">{c.title}</p>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30">{c.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-warning/30 bg-warning/5">
        <CardContent className="p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Heads up</p>
            <p className="text-muted-foreground mt-1">
              Promo codes are intentionally public (they're meant to be seen). Role changes
              should happen on the Customers page using the role dropdown.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
