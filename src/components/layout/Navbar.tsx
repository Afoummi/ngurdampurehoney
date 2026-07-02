import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, User, LogOut, ShoppingBag, Settings, Package, Shield } from "lucide-react";
import { useState } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useAuth } from "@/hooks/useAuth";
import { BrandLogo } from "@/components/brand/BrandLogo";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "Our Story" },
  { href: "/blog", label: "Journal" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, isModerator, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-18 md:h-20 items-center justify-between py-3">
        <BrandLogo />

        <nav className="hidden md:flex items-center gap-1" aria-label="Main">
          {navLinks.map((link) => {
            const active = location.pathname === link.href;
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute left-1/2 -translate-x-1/2 -bottom-0.5 w-6 h-0.5 rounded-full bg-honey" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {(isAdmin || isModerator) && (
            <Button
              variant="honey"
              size="sm"
              onClick={() => navigate(isAdmin ? "/admin" : "/moderator")}
              className="hidden sm:inline-flex"
            >
              <Shield className="h-4 w-4" />
              {isAdmin ? "Admin Dashboard" : "Moderator"}
            </Button>
          )}

          <CartDrawer />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Account menu">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2.5">
                  <p className="text-xs text-muted-foreground">Signed in as</p>
                  <p className="text-sm font-medium truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/account/orders")}>
                  <ShoppingBag className="h-4 w-4 mr-2" /> My Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/track-order")}>
                  <Package className="h-4 w-4 mr-2" /> Track Order
                </DropdownMenuItem>
                {isModerator && !isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/moderator")}>
                    <Shield className="h-4 w-4 mr-2" /> Moderator Dashboard
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Settings className="h-4 w-4 mr-2" /> Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")} className="hidden sm:inline-flex">
              Sign In
            </Button>
          )}


          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="flex flex-col gap-1 mt-10" aria-label="Mobile">
                {navLinks.map((link) => (
                  <Link key={link.href} to={link.href} onClick={() => setIsOpen(false)}
                    className={`px-3 py-3 rounded-md text-base font-medium transition-colors ${
                      location.pathname === link.href
                        ? "bg-honey-cream text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}>
                    {link.label}
                  </Link>
                ))}

                <div className="border-t pt-4 mt-4 flex flex-col gap-1">
                  {user ? (
                    <>
                      <Link to="/account/orders" onClick={() => setIsOpen(false)}
                        className="px-3 py-3 rounded-md flex items-center gap-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                        <ShoppingBag className="h-4 w-4" /> My Orders
                      </Link>
                      {isModerator && !isAdmin && (
                        <Link to="/moderator" onClick={() => setIsOpen(false)}
                          className="px-3 py-3 rounded-md flex items-center gap-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                          <Shield className="h-4 w-4" /> Moderator
                        </Link>
                      )}
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setIsOpen(false)}
                          className="px-3 py-3 rounded-md flex items-center gap-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                          <Settings className="h-4 w-4" /> Admin
                        </Link>
                      )}
                      <button onClick={() => { handleSignOut(); setIsOpen(false); }}
                        className="px-3 py-3 rounded-md flex items-center gap-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground text-left">
                        <LogOut className="h-4 w-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <Link to="/auth" onClick={() => setIsOpen(false)}
                      className="px-3 py-3 rounded-md flex items-center gap-2 text-sm font-medium text-honey-deep">
                      <User className="h-4 w-4" /> Sign In
                    </Link>
                  )}
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
