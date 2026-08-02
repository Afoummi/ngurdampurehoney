import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ScrollText, RefreshCw, Download, Search } from "lucide-react";
import { toCSV, downloadCSV } from "@/lib/csv";

interface AuditRow {
  id: string;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

const ACTION_TONE: Record<string, string> = {
  product_deleted: "bg-destructive/10 text-destructive border-destructive/30",
  order_deleted: "bg-destructive/10 text-destructive border-destructive/30",
  user_deleted: "bg-destructive/10 text-destructive border-destructive/30",
  role_changed: "bg-honey/15 text-honey-deep border-honey/40",
  settings_changed: "bg-honey/15 text-honey-deep border-honey/40",
  login_failed: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function AuditLogsPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("audit_logs")
      .select("id, actor_email, actor_role, action, resource_type, resource_id, details, ip_address, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (!error) setRows((data ?? []) as AuditRow[]);
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = rows.filter((r) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return [r.actor_email, r.actor_role, r.action, r.resource_type, r.resource_id, r.ip_address]
      .filter(Boolean)
      .some((v) => String(v).toLowerCase().includes(q));
  });

  const exportCsv = () => {
    const rowsOut = filtered.map((r) => ({
        time: new Date(r.created_at).toISOString(),
        actor: r.actor_email ?? "",
        role: r.actor_role ?? "",
        action: r.action,
        resource: `${r.resource_type ?? ""} ${r.resource_id ?? ""}`.trim(),
        ip: r.ip_address ?? "",
        details: r.details ? JSON.stringify(r.details) : "",
      })));
    downloadCSV("audit-logs.csv", toCSV(rowsOut));
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-card">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="font-display text-2xl flex items-center gap-2">
              <ScrollText className="w-5 h-5 text-honey-deep" /> Audit Logs
            </CardTitle>
            <CardDescription>
              Append-only record of sensitive staff activity. Visible to admins only.
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search actor, action, IP…"
                className="pl-9 w-full sm:w-64"
              />
            </div>
            <Button variant="outline" size="sm" onClick={load} disabled={isLoading}>
              <RefreshCw className="w-4 h-4" /> Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={filtered.length === 0}>
              <Download className="w-4 h-4" /> CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-honey-deep" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No activity recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto -mx-6 px-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">When</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead className="hidden lg:table-cell">IP</TableHead>
                    <TableHead className="hidden xl:table-cell">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="font-medium">{r.actor_email ?? "—"}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {r.actor_role ?? "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={ACTION_TONE[r.action] ?? "bg-muted text-foreground"}
                        >
                          {r.action.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        <div>{r.resource_type ?? "—"}</div>
                        <div className="text-muted-foreground break-all">{r.resource_id ?? ""}</div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                        {r.ip_address ?? "—"}
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-xs text-muted-foreground max-w-[22rem] truncate">
                        {r.details ? JSON.stringify(r.details) : ""}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
