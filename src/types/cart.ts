// Cart type definitions matching backend API schema

// Cart item creation schema
export interface CartItemCreate {
  product_id: string;
  quantity: number;
}

// Cart item update schema
export interface CartItemUpdate {
  quantity: number;
}

// Cart item output schema from backend
export interface CartItemOut {
  cart_item_id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product_amount: number;
  total_quantity_amount: number;
  created_datetime: string; // ISO datetime string
  last_updated_datetime: string; // ISO datetime string
}

// Cart item for frontend use (combines backend data with product info)
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  cart_item_id?: string; // Optional for items from backend
}