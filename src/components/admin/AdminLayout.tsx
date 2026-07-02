import { useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, LogOut, ExternalLink } from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LayoutDashboard, ShoppingCart, Package, Boxes, Users, Mail, Megaphone,
  BarChart3, FileText, Settings, UserCog, ShieldCheck, Image as ImageIcon,
} from "lucide-react";

const ADMIN_NAV = [
  {
    label: "Overview",
    items: [
      { to: "/admin/overview", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/admin/reports", label: "Reports", icon: FileText },
    ],
  },
  {
    label: "Commerce",
    items: [
      { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
      { to: "/admin/products", label: "Products", icon: Package },
      { to: "/admin/inventory", label: "Inventory", icon: Boxes },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/admin/media", label: "Media Library", icon: ImageIcon },
      { to: "/admin/promos", label: "Promo Banners", icon: Megaphone },
    ],
  },
  {
    label: "Audience",
    items: [
      { to: "/admin/customers", label: "Customers", icon: Users },
      { to: "/admin/newsletter", label: "Newsletter", icon: Mail },
    ],
  },
  {
    label: "Settings",
    items: [
      { to: "/admin/users", label: "Admin Users", icon: UserCog },
      { to: "/admin/security", label: "Security", icon: ShieldCheck },
      { to: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

const MODERATOR_NAV = [
  {
    label: "Workspace",
    items: [
      { to: "/moderator/overview", label: "Dashboard", icon: LayoutDashboard },
      { to: "/moderator/orders", label: "Orders", icon: ShoppingCart },
      { to: "/moderator/products", label: "Products", icon: Package },
      { to: "/moderator/inventory", label: "Inventory", icon: Boxes },
      { to: "/moderator/media", label: "Media", icon: ImageIcon },
      { to: "/moderator/customers", label: "Customers", icon: Users },
      { to: "/moderator/newsletter", label: "Newsletter", icon: Mail },
    ],
  },
];


interface AdminLayoutProps {
  variant?: "admin" | "moderator";
}

export function AdminLayout({ variant = "admin" }: AdminLayoutProps) {
  const { user, isLoading, isAdmin, isModerator, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const allowed = variant === "admin" ? isAdmin : isAdmin || isModerator;
  const groups = variant === "admin" ? ADMIN_NAV : MODERATOR_NAV;

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
      return;
    }
    if (!isLoading && user && !allowed) {
      toast.error(`${variant === "admin" ? "Admin" : "Moderator"} access required`);
      navigate("/");
    }
  }, [isLoading, user, allowed, navigate, variant]);

  if (isLoading || !allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-honey-deep" />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initials = (user?.email?.[0] || "A").toUpperCase();

  // Build breadcrumb
  const segments = location.pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1] || "overview";
  const title = last.charAt(0).toUpperCase() + last.slice(1);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <Sidebar collapsible="icon" className="border-r-0">
          <SidebarHeader className="border-b border-sidebar-border">
            <Link to={variant === "admin" ? "/admin/overview" : "/moderator/overview"}
              className="flex items-center gap-2.5 px-2 py-3 group-data-[collapsible=icon]:justify-center">
              <div className="w-9 h-9 rounded-lg bg-honey flex items-center justify-center flex-shrink-0 shadow-glow">
                <span className="font-display text-honey-foreground text-lg leading-none">N</span>
              </div>
              <div className="leading-tight group-data-[collapsible=icon]:hidden">
                <p className="font-display text-base text-sidebar-foreground">Ngurdam Honey</p>
                <p className="text-[10px] uppercase tracking-[0.15em] text-sidebar-foreground/60">
                  {variant === "admin" ? "Admin Console" : "Moderator"}
                </p>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            {groups.map((group) => (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const active = location.pathname === item.to;
                      return (
                        <SidebarMenuItem key={item.to}>
                          <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                            <Link to={item.to}>
                              <item.icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="View Store">
                  <Link to="/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    <span>View Store</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <div className="px-2 py-3 border-t border-sidebar-border flex items-center gap-2 group-data-[collapsible=icon]:hidden">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-honey text-honey-foreground text-xs font-semibold">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 leading-tight">
                <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.email}</p>
                <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
                  {variant === "admin" ? "Administrator" : "Moderator"}
                </p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/90 backdrop-blur flex items-center gap-4 px-4 md:px-8">
            <SidebarTrigger className="-ml-1" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {variant === "admin" ? "Admin" : "Moderator"} · {title}
              </p>
              <h1 className="font-display text-xl leading-none mt-0.5 truncate">{title}</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="hidden md:inline-flex">
              <ExternalLink className="w-4 h-4" /> Store
            </Button>
          </header>

          <main className="p-4 md:p-8 max-w-[1600px] mx-auto w-full">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
