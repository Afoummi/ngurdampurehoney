import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { BRAND, FORMATTED_ADDRESS } from "@/lib/brand";
import { MapPin, Phone, Mail, Building2 } from "lucide-react";

export function SettingsTab() {
  const { user, userRole } = useAuth();

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Business Information</CardTitle>
          <CardDescription>Used across receipts, emails and the website</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-5">
          <Field icon={Building2} label="Legal Name" value={BRAND.legalName} />
          <Field icon={Building2} label="Brand" value={BRAND.productName} />
          <Field icon={Mail} label="Email" value={BRAND.email} />
          <Field icon={Phone} label="Phone" value={BRAND.phones.join(" / ")} />
          <Field icon={MapPin} label="Address" value={FORMATTED_ADDRESS} full />
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Your Account</CardTitle>
          <CardDescription>Your admin account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <Badge variant="outline" className="bg-honey-cream text-honey-deep border-honey/30 capitalize">
              {userRole}
            </Badge>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">User ID</p>
            <p className="font-mono text-xs text-muted-foreground mt-1">{user?.id}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-card">
        <CardHeader>
          <CardTitle className="font-display text-2xl">Notifications</CardTitle>
          <CardDescription>How you're alerted about activity</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            New orders trigger a real-time notification in this dashboard and an email summary
            to <span className="font-medium text-foreground">{BRAND.email}</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ icon: Icon, label, value, full }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; full?: boolean }) {
  return (
    <div className={`flex gap-3 ${full ? "sm:col-span-2" : ""}`}>
      <div className="w-10 h-10 rounded-lg bg-honey-cream flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-honey-deep" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="font-medium text-sm mt-0.5">{value}</p>
      </div>
    </div>
  );
}
