import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, LogOut, Menu, User as UserIcon, Search, X, Package, Heart, LayoutDashboard } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
    const navigate = useNavigate();
    const { itemCount } = useCart();
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${searchQuery}`);
            setIsMenuOpen(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
        setIsMenuOpen(false);
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center px-4">
                {/* Logo */}
                <Link to="/" className="mr-6 flex items-center space-x-2">
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        ShopHub
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    <Link to="/" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        Home
                    </Link>
                    <Link to="/?category=new-arrivals" className="transition-colors hover:text-foreground/80 text-foreground/60">
                        New Arrivals
                    </Link>
                </div>

                {/* Search Bar - Desktop & Mobile flexible */}
                <div className="flex-1 flex justify-center px-4">
                    <form onSubmit={handleSearch} className="w-full max-w-sm relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search products..."
                            className="pl-9 h-9 w-full bg-muted/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>

                {/* Right Side Icons */}
                <div className="flex items-center space-x-2">
                    {/* Cart */}
                    <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/cart")}>
                        <ShoppingCart className="h-5 w-5" />
                        {itemCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-[10px]">
                                {itemCount}
                            </Badge>
                        )}
                    </Button>

                    {/* Auth Dropdown (Desktop) */}
                    <div className="hidden md:flex">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <UserIcon className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.user_email.split('@')[0]}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user.user_email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => navigate("/account")}>
                                        <UserIcon className="mr-2 h-4 w-4" /> Account
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate("/orders")}>
                                        <Package className="mr-2 h-4 w-4" /> Orders
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => navigate("/wishlist")}>
                                        <Heart className="mr-2 h-4 w-4" /> Wishlist
                                    </DropdownMenuItem>
                                    {user.role === 'admin' && (
                                        <DropdownMenuItem onClick={() => navigate("/admin")}>
                                            <LayoutDashboard className="mr-2 h-4 w-4" /> Admin
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-900 focus:text-red-900">
                                        <LogOut className="mr-2 h-4 w-4" /> Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button variant="default" size="sm" onClick={() => navigate("/auth")}>
                                Sign In
                            </Button>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden border-t p-4 space-y-4 bg-background">
                    <div className="space-y-2">
                        <Link to="/" className="block py-2 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/?category=new-arrivals" className="block py-2 text-sm font-medium" onClick={() => setIsMenuOpen(false)}>New Arrivals</Link>
                    </div>
                    <div className="border-t pt-4">
                        {user ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 py-2">
                                    <UserIcon className="h-4 w-4" />
                                    <span className="text-sm font-medium">{user.user_email}</span>
                                </div>
                                <Button variant="ghost" className="w-full justify-start pl-0" onClick={() => { navigate("/account"); setIsMenuOpen(false); }}>
                                    Account
                                </Button>
                                <Button variant="ghost" className="w-full justify-start pl-0" onClick={() => { navigate("/orders"); setIsMenuOpen(false); }}>
                                    Orders
                                </Button>
                                <Button variant="ghost" className="w-full justify-start pl-0" onClick={() => { navigate("/wishlist"); setIsMenuOpen(false); }}>
                                    Wishlist
                                </Button>
                                {user.role === 'admin' && (
                                    <Button variant="ghost" className="w-full justify-start pl-0" onClick={() => { navigate("/admin"); setIsMenuOpen(false); }}>
                                        Admin Dashboard
                                    </Button>
                                )}
                                <Button variant="ghost" className="w-full justify-start pl-0 text-red-500" onClick={handleLogout}>
                                    Log out
                                </Button>
                            </div>
                        ) : (
                            <Button className="w-full" onClick={() => { navigate("/auth"); setIsMenuOpen(false); }}>
                                Sign In
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
