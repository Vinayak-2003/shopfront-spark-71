import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  User,
  Heart,
  Menu,
  X,
  Sun,
  Moon,
  Laptop,
  Store,
  ShoppingBag,
  LogOut
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { theme, setTheme } = useTheme();

  // Handle case where cartItems might be null (loading state)
  const cartItemCount = cartItems ? cartItems.reduce((total, item) =>
    total + item.quantity, 0) : 0;
  const wishlistItemCount = wishlistItems ? wishlistItems.length : 0;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel navbar-mobile transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent group-hover:shadow-lg transition-shadow">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent xs-heading">
              ShopHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {user && (
              <Link to="/orders">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Orders
                </Button>
              </Link>
            )}

            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 touch-target">
                <Heart className="h-5 w-5" />
                {wishlistItemCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent hover:bg-accent"
                  >
                    {wishlistItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {user && (user.role === "admin" || user.role === "seller") && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                  <Store className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 touch-target">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-accent hover:bg-accent"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </Link>

            {user ? (
              <>
                <Link to="/account">
                  <Button variant="ghost" size="icon" className="hover:bg-primary/10 touch-target">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-destructive/10 touch-target">
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="default" className="bg-gradient-to-r from-primary to-primary/90 btn-responsive">
                  Sign In
                </Button>
              </Link>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:bg-primary/10 touch-target"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" className="touch-target" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
            {isMenuOpen && (
              <div className="fixed top-0 right-0 w-64 h-full bg-background shadow-lg p-4 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent xs-heading">
                    ShopHub
                  </span>
                  <Button variant="ghost" size="icon" className="touch-target" onClick={() => setIsMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex flex-col gap-4 mt-8 form-mobile">
                  <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start button-mobile">
                      <Heart className="mr-2 h-5 w-5" />
                      Wishlist {wishlistItemCount > 0 && `(${wishlistItemCount})`}
                    </Button>
                  </Link>

                  <Link to="/cart" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start button-mobile">
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Cart {cartItemCount > 0 && `(${cartItemCount})`}
                    </Button>
                  </Link>

                  {user ? (
                    <>
                      <Link to="/orders" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start button-mobile">
                          <ShoppingBag className="mr-2 h-5 w-5" />
                          My Orders
                        </Button>
                      </Link>

                      {user.role === "admin" || user.role === "seller" && (
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start button-mobile">
                            <Store className="mr-2 h-5 w-5" />
                            Admin Dashboard
                          </Button>
                        </Link>
                      )}

                      <Link to="/account" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="ghost" className="w-full justify-start button-mobile">
                          <User className="mr-2 h-5 w-5" />
                          Account
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        className="w-full justify-start button-mobile"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Sign Out
                      </Button>
                    </>
                  ) : (
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="default" className="w-full btn-responsive">
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>
                <div className="mt-auto">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="touch-target"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  >
                    {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}