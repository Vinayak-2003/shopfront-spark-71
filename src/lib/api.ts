// API Service Layer for FastAPI Backend
// This file contains all API call functions ready for FastAPI integration

import { API_CONFIG, getApiUrl, getHeaders } from "@/config/api";
import { Product } from "@/types/product";
import { CartItem } from "@/contexts/CartContext";

// Generic API request handler with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(endpoint);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      headers: getHeaders(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
    throw new Error("An unknown error occurred");
  }
}

// ============= PRODUCTS API =============

export const productsApi = {
  // Get all products
  getAll: async (): Promise<Product[]> => {
    return apiRequest<Product[]>(API_CONFIG.ENDPOINTS.PRODUCTS);
  },

  // Get single product by ID
  getById: async (id: string): Promise<Product> => {
    return apiRequest<Product>(API_CONFIG.ENDPOINTS.PRODUCT_DETAIL(id));
  },

  // Search products
  search: async (query: string): Promise<Product[]> => {
    return apiRequest<Product[]>(`${API_CONFIG.ENDPOINTS.PRODUCTS}?search=${encodeURIComponent(query)}`);
  },

  // Filter products by category
  getByCategory: async (category: string): Promise<Product[]> => {
    return apiRequest<Product[]>(`${API_CONFIG.ENDPOINTS.PRODUCTS}?category=${encodeURIComponent(category)}`);
  },
};

// ============= CART API =============

interface CartResponse {
  items: CartItem[];
  total: number;
}

export const cartApi = {
  // Get user's cart
  get: async (): Promise<CartResponse> => {
    return apiRequest<CartResponse>(API_CONFIG.ENDPOINTS.CART);
  },

  // Add item to cart
  addItem: async (productId: string, quantity: number = 1): Promise<CartResponse> => {
    return apiRequest<CartResponse>(API_CONFIG.ENDPOINTS.CART_ITEMS, {
      method: "POST",
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  },

  // Update item quantity
  updateItem: async (itemId: string, quantity: number): Promise<CartResponse> => {
    return apiRequest<CartResponse>(API_CONFIG.ENDPOINTS.CART_ITEM(itemId), {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
  },

  // Remove item from cart
  removeItem: async (itemId: string): Promise<CartResponse> => {
    return apiRequest<CartResponse>(API_CONFIG.ENDPOINTS.CART_ITEM(itemId), {
      method: "DELETE",
    });
  },

  // Clear entire cart
  clear: async (): Promise<void> => {
    return apiRequest<void>(API_CONFIG.ENDPOINTS.CART, {
      method: "DELETE",
    });
  },
};

// ============= ORDERS API =============

interface OrderData {
  items: CartItem[];
  total: number;
  shipping_address: {
    address: string;
    city: string;
    zip: string;
  };
  payment_method: string;
}

interface Order extends OrderData {
  id: string;
  status: string;
  created_at: string;
  user_id: string;
}

export const ordersApi = {
  // Create new order
  create: async (orderData: OrderData): Promise<Order> => {
    return apiRequest<Order>(API_CONFIG.ENDPOINTS.ORDERS, {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },

  // Get user's orders
  getAll: async (): Promise<Order[]> => {
    return apiRequest<Order[]>(API_CONFIG.ENDPOINTS.ORDERS);
  },

  // Get single order
  getById: async (id: string): Promise<Order> => {
    return apiRequest<Order>(API_CONFIG.ENDPOINTS.ORDER_DETAIL(id));
  },
};

// ============= PAYMENTS API =============

interface PaymentIntent {
  client_secret: string;
  amount: number;
}

interface CheckoutRequest {
  cart_items: CartItem[];
  payment_method: {
    card_number: string;
    card_name: string;
    expiry: string;
    cvv: string;
  };
  billing_address: {
    address: string;
    city: string;
    zip: string;
  };
}

interface CheckoutResponse {
  success: boolean;
  order_id: string;
  message: string;
}

export const paymentsApi = {
  // Create payment intent
  createIntent: async (amount: number): Promise<PaymentIntent> => {
    return apiRequest<PaymentIntent>(API_CONFIG.ENDPOINTS.PAYMENT_INTENT, {
      method: "POST",
      body: JSON.stringify({ amount }),
    });
  },

  // Process checkout
  checkout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    return apiRequest<CheckoutResponse>(API_CONFIG.ENDPOINTS.CHECKOUT, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ============= AUTH API (Optional - if not using Supabase) =============

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
  };
}

export const authApi = {
  // Login
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH_LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  // Register
  register: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return apiRequest<AuthResponse>(API_CONFIG.ENDPOINTS.AUTH_REGISTER, {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  // Logout
  logout: async (): Promise<void> => {
    return apiRequest<void>(API_CONFIG.ENDPOINTS.AUTH_LOGOUT, {
      method: "POST",
    });
  },

  // Get current user
  getCurrentUser: async (): Promise<AuthResponse["user"]> => {
    return apiRequest<AuthResponse["user"]>(API_CONFIG.ENDPOINTS.AUTH_ME);
  },
};
