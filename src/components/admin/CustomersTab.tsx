import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toCSV, downloadCSV } from "@/lib/csv";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { logAudit } from "@/lib/audit";

interface Customer {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  role: string;
}

interface CustomersTabProps {
  canManageRoles?: boolean;
}

export function CustomersTab({ canManageRoles = false }: CustomersTabProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const customersWithRoles = (profiles || []).map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.user_id);
        return { ...profile, role: userRole?.role || 'customer' };
      });

      setCustomers(customersWithRoles);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === currentUser?.id) {
      toast.error("You cannot change your own role");
      return;
    }

    try {
      const typedRole = newRole as "admin" | "moderator" | "customer";
      
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingRole) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role: typedRole })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert([{ user_id: userId, role: typedRole }]);
        if (error) throw error;
      }

      void logAudit({ action: "role_changed", resourceType: "user", resourceId: userId, details: { new_role: newRole } });
      toast.success(`Role updated to ${newRole}`);
      fetchCustomers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error("Failed to update role");
    }
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-500/10 text-red-600",
    moderator: "bg-blue-500/10 text-blue-600",
    customer: "bg-green-500/10 text-green-600",
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (customers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No customers yet</h3>
          <p className="text-muted-foreground">Customers will appear here when they register.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <CardTitle>Users</CardTitle>
          <CardDescription>View and manage registered users</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const rows = customers.map((c) => ({
              name: c.full_name || "",
              phone: c.phone || "",
              address: c.address || "",
              role: c.role,
              joined: format(new Date(c.created_at), "yyyy-MM-dd"),
            }));
            downloadCSV(`customers-${format(new Date(), "yyyy-MM-dd")}.csv`, toCSV(rows));
          }}
        >
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  {customer.full_name || 'Not provided'}
                  {customer.user_id === currentUser?.id && (
                    <span className="text-xs text-muted-foreground ml-1">(You)</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {customer.phone || 'Not provided'}
                </TableCell>
                <TableCell className="text-muted-foreground max-w-[200px] truncate">
                  {customer.address || 'Not provided'}
                </TableCell>
                <TableCell>
                  {canManageRoles && customer.user_id !== currentUser?.id ? (
                    <Select value={customer.role} onValueChange={(value) => handleRoleChange(customer.user_id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="customer">Customer</SelectItem>
                        <SelectItem value="moderator">Moderator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className={roleColors[customer.role] || ""}>
                      {customer.role}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(customer.created_at), 'MMM dd, yyyy')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
