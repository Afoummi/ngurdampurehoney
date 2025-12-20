import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export function SettingsTab() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Your admin account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="font-medium">{user?.email}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">User ID</label>
            <p className="font-mono text-sm">{user?.id}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Store Settings</CardTitle>
          <CardDescription>Configure your store settings</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Store settings are managed through your Shopify dashboard. Products, inventory, and pricing 
            are synced automatically from Shopify.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>Order notification settings</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You will receive email notifications when customers place new orders. 
            Real-time notifications also appear in this dashboard.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}