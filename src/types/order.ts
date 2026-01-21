// Order type definitions matching backend API schema

// Payment method enum from backend
export type PaymentMethod = "COD" | "UPI" | "Wallet" | "Card";

// Order status enum from backend
export type OrderStatus = 
  | "PENDING"
  | "CONFIRMED"
  | "PACKED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURN_REQUESTED"
  | "RETURNED"
  | "DELAY";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURN_REQUESTED: "Return Requested",
  RETURNED: "Returned",
  DELAY: "Delayed",
};

// Order item when creating an order
export interface OrderItemCreate {
  product_id: string;  // UUID
  quantity: number;
}

// Order item in response
export interface OrderItemOut {
  product_id: string;  // UUID
  product_name: string;
  price_at_purchase: number;
  quantity: number;
  total_price: number;
}

// Order creation schema
export interface OrderCreate {
  items: OrderItemCreate[];
  payment_method?: PaymentMethod;  // Default: "UPI"
}

// Order output schema from backend
export interface Order {
  order_id: string;  // UUID
  user_id: string;  // UUID
  shipping_address_id: string;  // UUID
  order_status: OrderStatus;
  payment_method: PaymentMethod;
  items?: OrderItemOut[];  // Optional because list view doesn't include items
  total_items: number;
  total_amount: number;
  order_placed_datetime: string;  // ISO datetime
  order_updated_datetime: string;  // ISO datetime
}

// Order update schema (for admin/seller)
export interface OrderUpdate {
  user_id: string;  // UUID
  order_id: string;  // UUID
  order_status: OrderStatus;
}
