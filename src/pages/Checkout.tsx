import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { ordersApi, addressApi } from "@/lib/api";
import { Address } from "@/types/address";
import { PaymentMethod } from "@/types/order";
import { MapPin, CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

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

export default function Checkout() {
  const { items, total, clearCart, redirectToLogin } = useCart();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("UPI");
  const [loading, setLoading] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { state: { from: location.pathname } });
    }
  }, [user, authLoading, navigate, location]);

  useEffect(() => {
    if ((!authLoading && !user) || (items && items.length === 0)) {
      navigate("/cart");
      return;
    }

    const fetchAddresses = async () => {
      try {
        const response = await addressApi.getAll();
        setAddresses(response || []);
        if (response && response.length > 0) {
          setSelectedAddressId(response[0].address_id);
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        toast.error("Failed to load addresses. Please add an address in your account.");
      }
    };

    if (items && items.length > 0) {
      fetchAddresses();
    }
  }, [items, navigate, user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddressId) {
      toast.error("Please select a delivery address");
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderData = {
        shipping_address_id: selectedAddressId,
        payment_method: paymentMethod,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price_at_purchase: item.price
        }))
      };

      const order = await ordersApi.create(orderData);


      // Clear cart after successful order
      clearCart();

      // Show success message and redirect
      toast.success("Order placed successfully!");
      navigate("/account");
    } catch (error: unknown) {
      console.error("Error creating order:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to place order. Please check your details and try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth or cart is initializing
  if (authLoading || !items) return null;

  // Redirect to login if not authenticated
  if (!user) {
    return null; // Will be redirected by useEffect
  }

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mobile-padding">
        <h1 className="text-3xl font-bold mb-8 heading-responsive">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8 grid-gap-mobile">
          <div className="lg:col-span-2">
            <Card className="shadow-transition">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6 form-stack">
                  {/* Shipping Address Selection */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address">Delivery Address</Label>
                      <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                        <SelectTrigger className="touch-target">
                          <SelectValue placeholder="Select delivery address" />
                        </SelectTrigger>
                        <SelectContent>
                          {addresses.length === 0 ? (
                            <div className="p-4 text-sm text-muted-foreground text-center">
                              No addresses found. Please add an address in your account.
                            </div>
                          ) : (
                            addresses.map((addr) => (
                              <SelectItem key={addr.address_id} value={addr.address_id}>
                                <div className="flex items-start gap-2">
                                  <MapPin className="h-4 w-4 mt-0.5" />
                                  <div>
                                    <p className="font-medium capitalize">{addr.address_type}</p>
                                    <p className="text-xs text-muted-foreground text-responsive">
                                      {addr.address_line_1}, {addr.city} - {addr.pincode}
                                    </p>
                                  </div>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1 text-responsive">
                        Don't have an address? <a href="/account" className="text-primary underline">Add one in your account</a>
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Method Selection */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Method
                    </h3>
                    <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
                      <SelectTrigger className="touch-target">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UPI">UPI</SelectItem>
                        <SelectItem value="COD">Cash on Delivery</SelectItem>
                        <SelectItem value="Card">Credit/Debit Card</SelectItem>
                        <SelectItem value="Wallet">Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    variant="accent"
                    size="lg"
                    className="w-full btn-responsive"
                    disabled={loading || !selectedAddressId}
                  >
                    <Lock className="mr-2 h-4 w-4" />
                    {loading ? "Processing..." : `Place Order - ${getCurrencySymbol(items?.[0]?.currency)}${total.toFixed(2)}`}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground text-responsive">
                    By placing this order, you agree to our terms and conditions
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-transition">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-responsive">
                      <span className="text-muted-foreground">
                        {item.name} x{item.quantity}
                      </span>
                      <span>{getCurrencySymbol(item.currency)}{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground text-responsive">
                    <span>Subtotal</span>
                    <span>{getCurrencySymbol(items?.[0]?.currency)}{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-responsive">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>{getCurrencySymbol(items?.[0]?.currency)}{total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}