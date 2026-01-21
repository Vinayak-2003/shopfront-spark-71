import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import AddressManagement from "@/components/AddressManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { User, Mail, LogOut, Phone, Shield, Calendar, MapPin, ShoppingBag, Sun, Moon } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ordersApi } from "@/lib/api";
import { useTheme } from "@/components/theme-provider";

export default function Account() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const [addressCount, setAddressCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchOrderCount = async () => {
      if (!user) return;
      
      try {
        const orders = await ordersApi.getAll();
        setOrderCount(orders.length);
      } catch (error) {
        console.error("Error fetching order count:", error);
      }
    };

    fetchOrderCount();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <LoadingSpinner text="Loading account..." />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mobile-padding">
        <h1 className="text-3xl font-bold mb-8 heading-responsive">My Account</h1>

        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl grid-gap-mobile">
          <Card className="shadow-transition hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Your account details and information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">Email</span>
                </div>
                <p className="font-medium text-nowrap-xs">{user.user_email}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">Phone Number</span>
                </div>
                <p className="font-medium">{user.user_contact}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Role</span>
                </div>
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Account ID</p>
                <p className="font-mono text-xs bg-muted p-2 rounded break-all">
                  {user.user_id}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Member Since</span>
                </div>
                <p className="font-medium">
                  {new Date(user.user_created_time).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              
              {user.user_last_login_time && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="font-medium">
                    {new Date(user.user_last_login_time).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">Saved Addresses</span>
                </div>
                <p className="font-medium">
                  {addressCount} {addressCount === 1 ? 'address' : 'addresses'}
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="text-sm">Total Orders</span>
                </div>
                <p className="font-medium">
                  {orderCount} {orderCount === 1 ? 'order' : 'orders'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-transition hover-lift">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 form-stack">
              <Button
                variant="outline"
                className="w-full justify-start button-mobile"
                onClick={() => navigate("/cart")}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                View Shopping Cart
              </Button>
              
              <AddressManagement onAddressCountChange={setAddressCount} />
              
              <Button
                variant="outline"
                className="w-full justify-start button-mobile"
                onClick={() => navigate("/orders")}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                My Orders
              </Button>
              
              {/* Theme Toggle */}
              <Button
                variant="outline"
                className="w-full justify-start button-mobile"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              </Button>
              
              <Button
                variant="destructive"
                className="w-full justify-start button-mobile"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}