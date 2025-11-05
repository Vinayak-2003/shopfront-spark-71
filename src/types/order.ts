// Order type definitions

import { CartItem } from "@/contexts/CartContext";

export interface ShippingAddress {
  address: string;
  city: string;
  state?: string;
  zip: string;
  country?: string;
}

export interface PaymentMethod {
  type: "credit_card" | "debit_card" | "paypal";
  last4?: string;
  brand?: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  tax?: number;
  shipping?: number;
  status: OrderStatus;
  shipping_address: ShippingAddress;
  payment_method: PaymentMethod;
  created_at: string;
  updated_at: string;
  tracking_number?: string;
}

export type OrderStatus = 
  | "pending" 
  | "processing" 
  | "shipped" 
  | "delivered" 
  | "cancelled" 
  | "refunded";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};
