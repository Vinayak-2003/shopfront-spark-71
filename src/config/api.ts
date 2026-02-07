// API Configuration for Backend Integration
// Update VITE_API_BASE_URL in .env.local for your backend URL

export const API_CONFIG = {
  // Base URL for your backend API
  // For local development: "http://localhost:8000"
  // For production: "https://your-api-domain.com"
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",

  // API Endpoints matching backend routes
  ENDPOINTS: {
    // Products
    PRODUCTS: "/api/v1/products/all-products",
    PRODUCT_DETAIL: (id: string) => `/api/v1/products/product-by-id/${id}`,
    PRODUCT_BY_NAME: (name: string) => `/api/v1/products/product-by-name/${name}`,
    PRODUCT_CREATE: "/api/v1/products/add-product",
    PRODUCT_UPDATE: (id: string) => `/api/v1/products/update-product/${id}`,
    PRODUCT_PARTIAL_UPDATE: (id: string) => `/api/v1/products/partial-update-product/${id}`,
    PRODUCT_DELETE: (id: string) => `/api/v1/products/delete-product/${id}`,

    // Brand
    BRANDS: "/api/v1/brand/get-all-brand",
    BRAND_CREATE: "/api/v1/brand/add-brand",
    BRAND_DELETE: (id: string) => `/api/v1/brand/delete-brand/${id}`,

    // Users / Auth
    AUTH_SIGNUP: "/api/v1/auth/signup",
    AUTH_LOGIN: "/api/v1/auth/login",
    AUTH_LOGOUT: "/api/v1/auth/logout",
    AUTH_REFRESH: "/api/v1/auth/refresh-token", // Refresh token endpoint (HttpOnly cookie)
    AUTH_ME: "/api/v1/users/me",
    USER_BY_EMAIL: (email: string) => `/api/v1/users/fetch-user-by-email/${email}`,
    USER_UPDATE: "/api/v1/users/update-me/",
    USER_UPDATE_ROLE: (email: string) => `/api/v1/users/update-user-role/${email}`,
    USER_DELETE: (email: string) => `/api/v1/users/delete-user-by-email/${email}`,

    // Address
    ADDRESS_GET_ALL: "/api/v1/address/fetch-all-address/me",
    ADDRESS_CREATE: "/api/v1/address/create-address/me",
    ADDRESS_UPDATE: (id: string) => `/api/v1/address/update-address/${id}`,
    ADDRESS_DELETE: (id: string) => `/api/v1/address/delete-address/${id}`,

    // Cart
    CART_GET_ALL: "/api/v1/cart/fetch-by-user",
    CART_CREATE: "/api/v1/cart/create-product-cart",
    CART_UPDATE: (id: string) => `/api/v1/cart/update-by-id/${id}`,
    CART_DELETE: (id: string) => `/api/v1/cart/delete-by-id/${id}`,

    // Orders
    ORDERS_GET_ALL: "/api/v1/orders/fetch-orders/me",
    ORDER_GET_BY_ID: (id: string) => `/api/v1/orders/fetch-order/me/${id}`,
    ORDER_CREATE: "/api/v1/orders/create-order/me",
    ORDER_UPDATE_STATUS: "/api/v1/orders/update-status",
    ORDER_CANCEL: (id: string) => `/api/v1/orders/cancel-order/me/${id}`,

    // Payments (To be implemented in backend)
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
    const token = localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Helper for form-urlencoded content type (used in login)
export const getFormHeaders = (includeAuth = false): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  if (includeAuth) {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};
