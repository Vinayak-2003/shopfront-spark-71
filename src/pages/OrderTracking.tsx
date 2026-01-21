import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { ordersApi, addressApi } from "@/lib/api";
import { Order, OrderStatus, PaymentMethod } from "@/types/order";
import { Address } from "@/types/address";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Hash,
  Calendar,
  MapPin,
  CreditCard,
  Search
} from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import OrderStatusTimeline from "@/components/OrderStatusTimeline";

// Order status labels
const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  "PENDING": "Pending",
  "CONFIRMED": "Confirmed",
  "PACKED": "Packed",
  "OUT_FOR_DELIVERY": "Out for Delivery",
  "DELIVERED": "Delivered",
  "CANCELLED": "Cancelled",
  "RETURN_REQUESTED": "Return Requested",
  "RETURNED": "Returned",
  "DELAY": "Delayed"
};

export default function OrderTracking() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [addresses, setAddresses] = useState<Record<string, Address>>({});
  const [loading, setLoading] = useState(true);
  const [searchOrderId, setSearchOrderId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If orderId is in URL, fetch that order
    if (orderId) {
      fetchOrderById(orderId);
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrderById = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch order
      const orderData = await ordersApi.getById(id);
      setOrder(orderData);

      // Fetch addresses if user is logged in
      if (user) {
        const addressResponse = await addressApi.getAll();
        const addressMap: Record<string, Address> = {};
        addressResponse.forEach(addr => {
          addressMap[addr.address_id] = addr;
        });
        setAddresses(addressMap);
      }
    } catch (error: unknown) {
      console.error("Error fetching order:", error);
      const message = error instanceof Error ? error.message : "Failed to load order. Please check the order ID and try again.";
      setError(message);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchOrderId.trim()) {
      navigate(`/track-order/${searchOrderId.trim()}`);
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle className="h-5 w-5" />;
      case "CANCELLED":
      case "RETURNED":
        return <XCircle className="h-5 w-5" />;
      case "CONFIRMED":
      case "PACKED":
      case "OUT_FOR_DELIVERY":
        return <Truck className="h-5 w-5" />;
      case "PENDING":
        return <Package className="h-5 w-5" />;
      case "DELAY":
        return <Clock className="h-5 w-5" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusVariant = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "DELIVERED":
        return "default";
      case "CANCELLED":
      case "RETURNED":
        return "destructive";
      case "PENDING":
      case "DELAY":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    const labels: Record<PaymentMethod, string> = {
      COD: "Cash on Delivery",
      UPI: "UPI",
      Card: "Credit/Debit Card",
      Wallet: "Wallet"
    };
    return labels[method] || method;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <LoadingSpinner text="Loading order details..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mobile-padding">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 heading-responsive">
              <Package className="h-8 w-8" />
              Order Tracking
            </h1>
            <p className="text-muted-foreground mt-1">
              Track your order status and delivery progress
            </p>
          </div>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Track Another Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="orderId" className="text-sm font-medium mb-1 block">
                  Order ID
                </Label>
                <Input
                  id="orderId"
                  value={searchOrderId}
                  onChange={(e) => setSearchOrderId(e.target.value)}
                  placeholder="Enter your order ID"
                  className="touch-target"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="h-10 btn-responsive">
                  Track Order
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-8">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
              <h2 className="text-2xl font-semibold mb-2 text-destructive">Order Not Found</h2>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              <Button onClick={() => {
                setError(null);
                setOrder(null);
                setSearchOrderId("");
              }}>
                Track Another Order
              </Button>
            </CardContent>
          </Card>
        )}

        {!order && !error && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-16 text-center">
              <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Track Your Order</h2>
              <p className="text-muted-foreground mb-6">
                Enter your order ID above to track your order status and delivery progress.
              </p>
            </CardContent>
          </Card>
        )}

        {order && (
          <Card className="overflow-hidden shadow-transition hover-lift">
            <CardHeader className="bg-muted/50">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                    <Hash className="h-5 w-5" />
                    <span className="font-mono">Order #{order.order_id.substring(0, 8).toUpperCase()}</span>
                    <Badge
                      variant={getStatusVariant(order.order_status)}
                      className="flex items-center gap-1"
                    >
                      {getStatusIcon(order.order_status)}
                      {ORDER_STATUS_LABELS[order.order_status]}
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Placed: {new Date(order.order_placed_datetime).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {order.total_items} {order.total_items === 1 ? 'item' : 'items'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
                  <div className="text-2xl font-bold">₹{order.total_amount.toFixed(2)}</div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Order Status Timeline */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <OrderStatusTimeline currentStatus={order.order_status} />
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <Package className="h-4 w-4" />
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {order.items && order.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg flex-wrap gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-nowrap-xs">{item.product_name}</p>
                          <p className="text-sm text-muted-foreground">
                            Quantity: {item.quantity} × ₹{item.price_at_purchase.toFixed(2)}
                          </p>
                        </div>
                        <p className="font-semibold text-lg">₹{item.total_price.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Shipping & Payment Details */}
                <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 grid-gap-mobile">
                  {/* Shipping Address */}
                  {user && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-muted-foreground text-sm font-semibold">
                        <MapPin className="h-4 w-4" />
                        Shipping Address
                      </div>
                      {addresses[order.shipping_address_id] ? (
                        <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                          <p className="font-medium capitalize">
                            {addresses[order.shipping_address_id].address_type}
                          </p>
                          <p className="text-sm font-semibold">
                            {addresses[order.shipping_address_id].receiver_name}
                          </p>
                          <p className="text-sm">
                            {addresses[order.shipping_address_id].address_line_1}
                          </p>
                          {addresses[order.shipping_address_id].address_line_2 && (
                            <p className="text-sm">
                              {addresses[order.shipping_address_id].address_line_2}
                            </p>
                          )}
                          {addresses[order.shipping_address_id].landmark && (
                            <p className="text-sm text-muted-foreground">
                              Landmark: {addresses[order.shipping_address_id].landmark}
                            </p>
                          )}
                          <p className="text-sm">
                            {addresses[order.shipping_address_id].city}, {addresses[order.shipping_address_id].state} - {addresses[order.shipping_address_id].pincode}
                          </p>
                          <p className="text-sm">
                            {addresses[order.shipping_address_id].country}
                          </p>
                          <Separator className="my-2" />
                          <p className="text-xs text-muted-foreground">
                            ☎️ {addresses[order.shipping_address_id].receiver_contact}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ✉️ {addresses[order.shipping_address_id].receiver_email}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-sm text-muted-foreground">Address details not available</p>
                          <p className="text-xs font-mono mt-1">
                            {order.shipping_address_id.substring(0, 16)}...
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment & Status */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="text-muted-foreground text-sm font-semibold">Payment Method</div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="font-medium">{getPaymentMethodLabel(order.payment_method)}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-muted-foreground text-sm font-semibold">Last Updated</div>
                      <p className="text-sm text-responsive">
                        {new Date(order.order_updated_datetime).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}