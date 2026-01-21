import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  CreditCard
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

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Record<string, Address>>({});
  const [orderDetails, setOrderDetails] = useState<Record<string, Order>>({});
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Fetch orders
        const ordersData = await ordersApi.getAll();
        setOrders(ordersData);

        // Fetch addresses
        const addressResponse = await addressApi.getAll();
        const addressMap: Record<string, Address> = {};
        addressResponse.forEach(addr => {
          addressMap[addr.address_id] = addr;
        });
        setAddresses(addressMap);
      } catch (error: unknown) {
        console.error("Error fetching orders:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to load orders. Please try again later.";
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchOrderDetails = async (orderId: string) => {
    try {

      const details = await ordersApi.getById(orderId);


      setOrderDetails(prev => ({ ...prev, [orderId]: details }));
      setExpandedOrderId(orderId);
      toast.success("Order details loaded");
    } catch (error: unknown) {
      console.error("Error fetching order details:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load order details. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await ordersApi.cancel(orderId);
      setOrders(prev =>
        prev.map(order =>
          order.order_id === orderId
            ? { ...order, order_status: "CANCELLED" }
            : order
        )
      );
      toast.success("Order cancelled successfully");
    } catch (error: unknown) {
      console.error("Error cancelling order:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to cancel order. Please try again.";
      toast.error(errorMessage);
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

  const canCancelOrder = (status: OrderStatus): boolean => {
    return ["PENDING", "CONFIRMED"].includes(status);
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

  // Handle authentication states
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <LoadingSpinner text="Loading your orders..." />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return null; // Will be redirected by useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navbar />
        <LoadingSpinner text="Loading your orders..." />
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
              <ShoppingBag className="h-8 w-8" />
              My Orders
            </h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your order history
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/")}>
            Continue Shopping
          </Button>
        </div>

        {orders.length === 0 ? (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-16 text-center">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven't placed any orders yet. Start shopping to see your orders here!
              </p>
              <Button onClick={() => navigate("/")} size="lg">
                Start Shopping
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 card-stack">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                You have {orders.length} {orders.length === 1 ? 'order' : 'orders'} in total
              </AlertDescription>
            </Alert>

            <div className="grid gap-6">
              {orders.map((order) => {
                const detailedOrder = orderDetails[order.order_id] || order;
                const isExpanded = expandedOrderId === order.order_id;
                const hasItems = detailedOrder.items && detailedOrder.items.length > 0;
                const shippingAddress = addresses[order.shipping_address_id];

                return (
                  <Card key={order.order_id} className="overflow-hidden hover:shadow-lg transition-shadow shadow-transition hover-lift">
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
                          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                            <h4 className="font-semibold flex items-center gap-2">
                              <Package className="h-4 w-4" />
                              Order Items
                            </h4>
                            {!hasItems && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="button-mobile"
                                onClick={() => fetchOrderDetails(order.order_id)}
                              >
                                {isExpanded ? "Hide Items" : "View Items"}
                              </Button>
                            )}
                          </div>
                          <div className="space-y-3">
                            {hasItems ? (
                              detailedOrder.items.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg flex-wrap gap-2">
                                  <div className="flex-1">
                                    <p className="font-medium text-nowrap-xs">{item.product_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      Quantity: {item.quantity} × ₹{item.price_at_purchase.toFixed(2)}
                                    </p>
                                  </div>
                                  <p className="font-semibold text-lg">₹{item.total_price.toFixed(2)}</p>
                                </div>
                              ))
                            ) : (
                              <div className="p-3 bg-muted/30 rounded-lg text-center text-muted-foreground">
                                <p className="text-sm">Click "View Items" to see order details</p>
                                <p className="text-xs mt-1">{order.total_items} items • Total: ₹{order.total_amount.toFixed(2)}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator />

                        {/* Shipping & Payment Details */}
                        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6 grid-gap-mobile">
                          {/* Shipping Address */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-muted-foreground text-sm font-semibold">
                              <MapPin className="h-4 w-4" />
                              Shipping Address
                            </div>
                            {shippingAddress ? (
                              <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                                <p className="font-medium capitalize">{shippingAddress.address_type}</p>
                                <p className="text-sm font-semibold">{shippingAddress.receiver_name}</p>
                                <p className="text-sm">{shippingAddress.address_line_1}</p>
                                {shippingAddress.address_line_2 && (
                                  <p className="text-sm">{shippingAddress.address_line_2}</p>
                                )}
                                {shippingAddress.landmark && (
                                  <p className="text-sm text-muted-foreground">Landmark: {shippingAddress.landmark}</p>
                                )}
                                <p className="text-sm">{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}</p>
                                <p className="text-sm">{shippingAddress.country}</p>
                                <Separator className="my-2" />
                                <p className="text-xs text-muted-foreground">☎️ {shippingAddress.receiver_contact}</p>
                                <p className="text-xs text-muted-foreground">✉️ {shippingAddress.receiver_email}</p>
                              </div>
                            ) : (
                              <div className="p-3 bg-muted/30 rounded-lg">
                                <p className="text-sm text-muted-foreground">Address details not available</p>
                                <p className="text-xs font-mono mt-1">{order.shipping_address_id.substring(0, 16)}...</p>
                              </div>
                            )}
                          </div>

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

                        {/* Actions */}
                        <div className="flex gap-3 pt-4 flex-wrap">
                          {canCancelOrder(order.order_status) && (
                            <Button
                              variant="destructive"
                              className="flex-1 button-mobile"
                              onClick={() => handleCancelOrder(order.order_id)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Order
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}