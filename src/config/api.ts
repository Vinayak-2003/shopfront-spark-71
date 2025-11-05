// API Configuration for FastAPI Backend Integration
// Update these values when connecting to your FastAPI backend

export const API_CONFIG = {
  // Base URL for your FastAPI backend
  // For local development: "http://localhost:8000"
  // For production: "https://your-api-domain.com"
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  
  // API Endpoints
  ENDPOINTS: {
    // Products
    PRODUCTS: "/api/products",
    PRODUCT_DETAIL: (id: string) => `/api/products/${id}`,
    
    // Cart
    CART: "/api/cart",
    CART_ITEMS: "/api/cart/items",
    CART_ITEM: (id: string) => `/api/cart/items/${id}`,
    
    // Orders
    ORDERS: "/api/orders",
    ORDER_DETAIL: (id: string) => `/api/orders/${id}`,
    
    // Auth (if using custom auth instead of Supabase)
    AUTH_LOGIN: "/api/auth/login",
    AUTH_REGISTER: "/api/auth/register",
    AUTH_LOGOUT: "/api/auth/logout",
    AUTH_ME: "/api/auth/me",
    
    // Payments
    CHECKOUT: "/api/checkout",
    PAYMENT_INTENT: "/api/payments/intent",
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 30000,
  
  // Retry configuration
  RETRY: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
  },
};

// Helper function to construct full URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// HTTP headers configuration
export const getHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  // Add authorization token if needed
  if (includeAuth) {
    const token = localStorage.getItem("auth_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  
  return headers;
};
