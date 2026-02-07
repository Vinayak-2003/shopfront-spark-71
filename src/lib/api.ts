// API Service Layer for Backend
// All API call functions matching backend OpenAPI specification

import { API_CONFIG, getApiUrl, getHeaders, getFormHeaders } from "@/config/api";
import { jwtDecode } from "jwt-decode";
import { Product, ProductCreate, ProductUpdate, ProductFilter, Brand, BrandCreate } from "@/types/product";
import { User, UserCreate, UserUpdate, LoginRequest, TokenSchema } from "@/types/user";
import { Address, AddressCreate, AddressUpdate } from "@/types/address";
import { Order, OrderCreate, OrderUpdate } from "@/types/order";
import { CartItemCreate, CartItemUpdate, CartItemOut, CartItem } from "@/types/cart";

// Token management (Memory Storage)
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};
export const getAccessToken = () => accessToken; // derived for debugging if needed

// Helper to check token expiry
const isTokenExpiringSoon = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    if (!decoded.exp) return true;
    // Refresh if expiring in less than 1 minute
    return decoded.exp < (Date.now() / 1000) + 60;
  } catch (error) {
    return true;
  }
};

// Token refresh queue handling
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string | null) => void; reject: (error: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Refresh token function
export const refreshAccessToken = async (): Promise<string | null> => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    // Call refresh endpoint - strict "HttpOnly Cookie" flow means no headers/body needed
    // Browser sends the cookie automatically
    const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.AUTH_REFRESH), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Required to send/receive HttpOnly cookies
    });

    if (!response.ok) {
      throw new Error("Refresh failed");
    }

    const data = await response.json();
    const newAccessToken = data.access_token;

    setAccessToken(newAccessToken);
    processQueue(null, newAccessToken);

    return newAccessToken;
  } catch (error) {
    processQueue(error, null);
    setAccessToken(null); // Clear invalid token
    throw error;
  } finally {
    isRefreshing = false;
  }
};

// Generic API request handler with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  let url = getApiUrl(endpoint);

  // Interceptor Check: Is token expiring?
  // Only check if we are making an authenticated request (implied by having a token)
  // And we are NOT already trying to refresh (to avoid infinite loops)
  if (accessToken && !url.includes(API_CONFIG.ENDPOINTS.AUTH_REFRESH) && isTokenExpiringSoon(accessToken)) {
    try {
      await refreshAccessToken();
    } catch (error) {
      console.warn("Token auto-refresh failed:", error);
      // We proceed anyway, the call might fail with 401 and be caught below
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    // Re-get headers to ensure latest token is used
    // If options.headers exists, we merge carefully
    let currentOptions = { ...options };
    if (!currentOptions.headers && accessToken) {
      currentOptions.headers = getHeaders(true);
    }

    // Default to including credentials for all same-origin requests if needed, 
    // or specifically for endpoints that need cookies. 
    // For safety with CORS, sometimes 'include' is tricky, but for refresh/logout it's needed.
    // We will add it specifically where needed or globally if we trust the backend CORS.
    // Assuming backend handles CORS with credentials: true

    let response = await fetch(url, {
      ...currentOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Response Interceptor: Handle 401
    if (response.status === 401 && !url.includes(API_CONFIG.ENDPOINTS.AUTH_LOGIN) && !url.includes(API_CONFIG.ENDPOINTS.AUTH_REFRESH)) {
      try {
        // Keep strict: Only try refresh if we think it might help
        const newToken = await refreshAccessToken();
        if (newToken) {
          // Retry original request with new token
          const retryHeaders = getHeaders(true);
          response = await fetch(url, {
            ...currentOptions,
            headers: {
              ...currentOptions.headers,
              ...retryHeaders
            } as HeadersInit,
            signal: new AbortController().signal // New signal
          });
        }
      } catch (refreshError) {
        // If refresh fails, we throw the original 401 error logic below
        console.error("Retry after 401 failed:", refreshError);
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error Response:", response.status, errorData);

      // Provide more descriptive error messages
      let errorMessage = `API Error: ${response.status} ${response.statusText}`;
      if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((err: any) => err.msg).join(", ");
        } else {
          errorMessage = errorData.detail;
        }
      } else if (response.status === 401) {
        errorMessage = "Unauthorized access. Please log in again.";
      } else if (response.status === 403) {
        errorMessage = "Access forbidden. You don't have permission to perform this action.";
      } else if (response.status === 404) {
        errorMessage = "Resource not found.";
      } else if (response.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    return data as T;
  } catch (error) {
    console.error("API Request Failed:", url, error);
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout. Please check your connection and try again.");
      }
      throw error;
    }
    throw new Error("An unknown error occurred. Please try again.");
  }
}

// Helper to map backend product (product_image) to frontend interface (image)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapBackendProduct = (data: any): Product => {
  return {
    ...data,
    image: data.product_image || data.image || ""
  };
};

// ============= PRODUCTS API =============

interface ProductsResponse {
  items: Product[];
  total: number;
  page?: number;
  per_page?: number;
  total_pages?: number;
}

export const productsApi = {
  // Get all products with pagination
  getAll: async (pageNo: number = 1, perPage: number = 100): Promise<ProductsResponse> => {
    const endpoint = `${API_CONFIG.ENDPOINTS.PRODUCTS}?page_no=${pageNo}&per_page=${perPage}`;
    const response = await apiRequest<any>(endpoint, {
      headers: getHeaders(false),
    });

    // Handle list response directly or wrapped object
    let items: any[] = [];
    if (Array.isArray(response)) {
      items = response;
    } else if (response.items) {
      items = response.items;
    }

    return {
      items: items.map(mapBackendProduct),
      total: items.length, // Fallback if no total provided
      ...response
    };
  },

  // Get single product by ID
  getById: async (id: string): Promise<Product> => {
    const data = await apiRequest<any>(API_CONFIG.ENDPOINTS.PRODUCT_DETAIL(id), {
      headers: getHeaders(false),
    });
    return mapBackendProduct(data);
  },

  // Search products by name with filters
  searchByName: async (
    name: string,
    filters?: { category?: string; min_price?: number; max_price?: number }
  ): Promise<Product[]> => {
    let endpoint = API_CONFIG.ENDPOINTS.PRODUCT_BY_NAME(name);
    const params = new URLSearchParams();

    if (filters?.category) params.append("category", filters.category);
    if (filters?.min_price) params.append("min_price", filters.min_price.toString());
    if (filters?.max_price) params.append("max_price", filters.max_price.toString());

    const queryString = params.toString();
    if (queryString) endpoint += `?${queryString}`;

    const data = await apiRequest<any[]>(endpoint, {
      headers: getHeaders(false),
    });
    return data.map(mapBackendProduct);
  },

  // Create new product (requires auth)
  create: async (product: ProductCreate): Promise<Product> => {
    return apiRequest<Product>(API_CONFIG.ENDPOINTS.PRODUCT_CREATE, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(product),
    });
  },

  // Update product (requires auth)
  update: async (id: string, product: ProductUpdate): Promise<Product> => {
    return apiRequest<Product>(API_CONFIG.ENDPOINTS.PRODUCT_UPDATE(id), {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(product),
    });
  },

  // Partial update product (requires auth)
  partialUpdate: async (id: string, product: ProductUpdate): Promise<Product> => {
    return apiRequest<Product>(API_CONFIG.ENDPOINTS.PRODUCT_PARTIAL_UPDATE(id), {
      method: "PATCH",
      headers: getHeaders(true),
      body: JSON.stringify(product),
    });
  },

  // Delete product (requires auth)
  delete: async (id: string): Promise<void> => {
    return apiRequest<void>(API_CONFIG.ENDPOINTS.PRODUCT_DELETE(id), {
      method: "DELETE",
      headers: getHeaders(true),
    });
  },
};

// ============= BRANDS API =============

interface BrandsResponse {
  items: Brand[];
  total: number;
}

export const brandsApi = {
  // Get all brands with pagination
  getAll: async (pageNo: number = 1, perPage: number = 100): Promise<BrandsResponse> => {
    const endpoint = `${API_CONFIG.ENDPOINTS.BRANDS}?page_no=${pageNo}&per_page=${perPage}`;
    const response = await apiRequest<any>(endpoint, {
      headers: getHeaders(false),
    });

    // Standardization of response
    let items: any[] = [];
    if (Array.isArray(response)) {
      items = response;
    } else if (response.items) {
      items = response.items;
    }

    return {
      items: items,
      total: items.length
    };
  },

  // Add new brand (requires auth)
  create: async (brand: BrandCreate): Promise<Brand> => {
    return apiRequest<Brand>(API_CONFIG.ENDPOINTS.BRAND_CREATE, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(brand),
    });
  },

  // Delete brand (requires auth)
  delete: async (brandId: string): Promise<void> => {
    return apiRequest<void>(API_CONFIG.ENDPOINTS.BRAND_DELETE(brandId), {
      method: "DELETE",
      headers: getHeaders(true),
    });
  },
};

// ============= AUTH / USERS API =============

export const authApi = {
  // User signup
  signup: async (userData: UserCreate): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(API_CONFIG.ENDPOINTS.AUTH_SIGNUP, {
      method: "POST",
      headers: getHeaders(false),
      body: JSON.stringify(userData),
    });
  },

  // User login - returns tokens
  login: async (email: string, password: string): Promise<TokenSchema> => {
    const formData = new URLSearchParams();
    formData.append("username", email);  // Backend expects 'username' field
    formData.append("password", password);
    formData.append("grant_type", "password");

    return apiRequest<TokenSchema>(API_CONFIG.ENDPOINTS.AUTH_LOGIN, {
      method: "POST",
      headers: getFormHeaders(false),
      body: formData.toString(),
      credentials: "include", // For setting the refresh token cookie
    });
  },

  // User logout
  logout: async (): Promise<void> => {
    // We rely on the backend to clear the cookie
    await apiRequest<void>(API_CONFIG.ENDPOINTS.AUTH_LOGOUT, {
      method: "POST",
      headers: getHeaders(true),
      credentials: "include"
    });
  },

  // Get current user (requires auth)
  getCurrentUser: async (): Promise<User> => {
    return apiRequest<User>(API_CONFIG.ENDPOINTS.AUTH_ME, {
      headers: getHeaders(true),
    });
  },

  // Get user by email (requires auth)
  getUserByEmail: async (email: string): Promise<User> => {
    return apiRequest<User>(API_CONFIG.ENDPOINTS.USER_BY_EMAIL(email), {
      headers: getHeaders(true),
    });
  },

  // Update current user (requires auth)
  updateMe: async (userData: UserUpdate): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(API_CONFIG.ENDPOINTS.USER_UPDATE, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(userData),
    });
  },

  // Update user role (admin only)
  updateUserRole: async (email: string, role: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(API_CONFIG.ENDPOINTS.USER_UPDATE_ROLE(email), {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify({ role }),
    });
  },

  // Delete user by email (requires auth)
  deleteUser: async (email: string): Promise<void> => {
    return apiRequest<void>(API_CONFIG.ENDPOINTS.USER_DELETE(email), {
      method: "DELETE",
      headers: getHeaders(true),
    });
  },
};

// ============= CART API =============

interface CartResponse {
  items: CartItemOut[];
  total: number;
  page?: number;
  per_page?: number;
}

export const cartApi = {
  // Get user's cart
  getAll: async (pageNo: number = 1, perPage: number = 100): Promise<CartResponse> => {
    const endpoint = `${API_CONFIG.ENDPOINTS.CART_GET_ALL}?page_no=${pageNo}&per_page=${perPage}`;
    return apiRequest<CartResponse>(endpoint, {
      headers: getHeaders(true),
    });
  },

  // Add item to cart
  addItem: async (cartItem: CartItemCreate): Promise<CartItemOut> => {
    return apiRequest<CartItemOut>(API_CONFIG.ENDPOINTS.CART_CREATE, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(cartItem),
    });
  },

  // Update item quantity
  updateItem: async (cartItemId: string, cartItem: CartItemUpdate): Promise<CartItemOut> => {
    return apiRequest<CartItemOut>(API_CONFIG.ENDPOINTS.CART_UPDATE(cartItemId), {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(cartItem),
    });
  },

  // Remove item from cart
  removeItem: async (cartItemId: string): Promise<void> => {
    return apiRequest<void>(API_CONFIG.ENDPOINTS.CART_DELETE(cartItemId), {
      method: "DELETE",
      headers: getHeaders(true),
    });
  },

  // Clear entire cart (we'll implement this by removing all items)
  clear: async (): Promise<void> => {
    // This will be implemented by the frontend by removing all items
    // The backend doesn't seem to have a specific endpoint for clearing all items
    throw new Error("Not implemented - clear cart by removing individual items");
  },
};

// ============= ORDERS API =============

interface OrdersResponse {
  items: Order[];
  total: number;
  page?: number;
  per_page?: number;
}

export const ordersApi = {
  // Get all orders for current user with pagination
  getAll: async (pageNo: number = 1, perPage: number = 10): Promise<Order[]> => {
    const endpoint = `${API_CONFIG.ENDPOINTS.ORDERS_GET_ALL}?page_no=${pageNo}&per_page=${perPage}`;

    // Ensure we have the latest token
    const token = localStorage.getItem("access_token");

    if (!token) {
      console.warn("No authentication token found!");
      throw new Error("Authentication required to fetch orders");
    }

    const response = await apiRequest<any>(endpoint, {
      headers: getHeaders(true),
    });



    // Backend returns paginated response with orders array
    // Handle multiple possible response formats
    if (Array.isArray(response)) {
      return response as Order[];
    } else if (response && response.orders) {
      // Backend uses 'orders' field (not 'items')
      return response.orders as Order[];
    } else if (response && response.items) {
      return response.items as Order[];
    } else if (response && response.data) {
      return response.data as Order[];
    }

    console.warn("Could not extract orders from response:", response);
    return [];
  },

  // Get single order by ID
  getById: async (orderId: string): Promise<Order> => {
    return apiRequest<Order>(API_CONFIG.ENDPOINTS.ORDER_GET_BY_ID(orderId), {
      headers: getHeaders(true),
    });
  },

  // Create new order
  create: async (orderData: OrderCreate): Promise<Order> => {
    return apiRequest<Order>(API_CONFIG.ENDPOINTS.ORDER_CREATE, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(orderData),
    });
  },

  // Update order status (admin/seller only)
  updateStatus: async (orderUpdate: OrderUpdate): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(API_CONFIG.ENDPOINTS.ORDER_UPDATE_STATUS, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(orderUpdate),
    });
  },

  // Cancel order
  cancel: async (orderId: string): Promise<{ message: string }> => {
    return apiRequest<{ message: string }>(API_CONFIG.ENDPOINTS.ORDER_CANCEL(orderId), {
      method: "DELETE",
      headers: getHeaders(true),
    });
  },
};

// ============= PAYMENTS API (To be implemented in backend) =============

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
      headers: getHeaders(true),
      body: JSON.stringify({ amount }),
    });
  },

  // Process checkout
  checkout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    return apiRequest<CheckoutResponse>(API_CONFIG.ENDPOINTS.CHECKOUT, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(data),
    });
  },
};

// ============= ADDRESS API =============

export const addressApi = {
  // Get all addresses for current user
  getAll: async (): Promise<Address[]> => {
    return apiRequest<Address[]>(API_CONFIG.ENDPOINTS.ADDRESS_GET_ALL, {
      headers: getHeaders(true),
    });
  },

  // Create new address
  create: async (addressData: AddressCreate): Promise<Address> => {
    return apiRequest<Address>(API_CONFIG.ENDPOINTS.ADDRESS_CREATE, {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify(addressData),
    });
  },

  // Update existing address
  update: async (addressId: string, addressData: AddressUpdate): Promise<Address> => {
    return apiRequest<Address>(API_CONFIG.ENDPOINTS.ADDRESS_UPDATE(addressId), {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(addressData),
    });
  },

  // Delete address
  delete: async (addressId: string): Promise<void> => {
    return apiRequest<void>(API_CONFIG.ENDPOINTS.ADDRESS_DELETE(addressId), {
      method: "DELETE",
      headers: getHeaders(true),
    });
  },
};
