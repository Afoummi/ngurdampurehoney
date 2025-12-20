import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Menu, User, LogOut, ShoppingBag, Settings } from "lucide-react";
import { useState } from "react";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-honey-gradient flex items-center justify-center">
            <span className="text-xl font-bold text-primary-foreground">🍯</span>
          </div>
          <span className="font-display text-xl font-bold text-foreground">AB Sardauna</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location.pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <CartDrawer />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/account/orders")}>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  My Orders
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Settings className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          )}
          
          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`text-lg font-medium transition-colors hover:text-primary ${
                      location.pathname === link.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {user ? (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <Link
                        to="/account/orders"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 text-lg font-medium text-muted-foreground hover:text-primary"
                      >
                        <ShoppingBag className="h-5 w-5" />
                        My Orders
                      </Link>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 text-lg font-medium text-muted-foreground hover:text-primary"
                      >
                        <Settings className="h-5 w-5" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 text-lg font-medium text-muted-foreground hover:text-primary"
                    >
                      <LogOut className="h-5 w-5" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-lg font-medium text-primary"
                  >
                    <User className="h-5 w-5" />
                    Sign In
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
