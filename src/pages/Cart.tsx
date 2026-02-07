import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Skeleton from "@/components/Skeleton";
import { useEffect } from "react";

// Helper to get currency symbol
const getCurrencySymbol = (currency: string = "INR") => {
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EURO: "€",
    "POUND STERLING": "£",
    YEN: "¥",
    "RUSSIAN RUBLE": "₽",
  };
  return symbols[currency] || "₹";
};

export default function Cart() {
  const { items, removeItem, updateQuantity, total, redirectToLogin } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { state: { from: location.pathname } });
    }
  }, [user, authLoading, navigate, location]);

  // Show skeleton loaders while cart is initializing or auth is loading
  if (authLoading || items === null) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 mobile-padding">
          <Skeleton className="h-10 w-48 mb-8" />

          <div className="grid lg:grid-cols-3 gap-8 grid-gap-mobile">
            <div className="lg:col-span-2 card-stack">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex gap-4 flex-col sm:flex-row">
                      <Skeleton className="w-24 h-24 rounded" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-5 w-1/2" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-8" />
                          <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-6 w-20 ml-auto" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-10 w-full rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return null; // Will be redirected by useEffect
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center mobile-padding">
          <ShoppingBag className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Start shopping to add items to your cart
          </p>
          <Button variant="accent" onClick={() => navigate("/")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mobile-padding">
        <h1 className="text-3xl font-bold mb-8 heading-responsive">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8 grid-gap-mobile">
          <div className="lg:col-span-2 card-stack">
            {items.map((item) => (
              <Card key={item.id} className="shadow-transition hover-lift">
                <CardContent className="p-6">
                  <div className="flex gap-4 flex-col sm:flex-row">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1 text-nowrap-xs">{item.name}</h3>
                      <p className="text-accent font-bold mb-4">
                        {getCurrencySymbol(item.currency)}{item.price}
                      </p>

                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="touch-target"
                            onClick={async () => await updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="touch-target"
                            onClick={async () => await updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="touch-target"
                          onClick={async () => await removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right sm:text-right">
                      <p className="font-bold text-lg">
                        {getCurrencySymbol(item.currency)}{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-transition">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-xl font-bold">Order Summary</h2>
                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{getCurrencySymbol(items?.[0]?.currency)}{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>{getCurrencySymbol(items?.[0]?.currency)}{total.toFixed(2)}</span>
                </div>

                <Button
                  variant="accent"
                  size="lg"
                  className="w-full btn-responsive"
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </Button>

                <Button
                  variant="outline"
                  className="w-full btn-responsive"
                  onClick={() => navigate("/")}
                >
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}