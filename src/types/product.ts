// Product type definitions matching backend API schema

// Enums from backend
export type Currency = "INR" | "USD" | "EURO" | "POUND STERLING" | "YEN" | "RUSSIAN RUBLE";
export type ProductStatus = "Active" | "Inactive" | "Discontinued";
export type Category = "Men" | "Women" | "Kids";

// Product interface matching backend ProductOut schema
export interface Product {
  product_id: string;  // UUID from backend
  product_name: string;
  description: string;
  price: number;
  discount_price: number;
  currency: Currency;
  available_quantity: number;
  status: ProductStatus;
  brand_id: string;
  category: Category;
  created_at: string;  // ISO datetime string
  updated_at: string;  // ISO datetime string
  image?: string;  // Optional - for frontend use
}

// Product creation schema
export interface ProductCreate {
  product_name: string;
  description: string;
  price: number;
  discount_price: number;
  currency: Currency;
  available_quantity: number;
  status: ProductStatus;
  brand_id: string;
  category: Category;
  image?: string;
}

// Product update schema (all fields optional)
export interface ProductUpdate {
  product_name?: string | null;
  description?: string | null;
  price?: number | null;
  discount_price?: number | null;
  currency?: Currency | null;
  available_quantity?: number | null;
  status?: ProductStatus | null;
  brand_id?: string | null;
  category?: Category | null;
  image?: string | null;
}

// Brand interface
export interface Brand {
  brand_id: string;
  brand_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface BrandCreate {
  brand_name: string;
}

// Product filter for search/filter operations
export interface ProductFilter {
  category?: Category;
  min_price?: number;
  max_price?: number;
  search?: string;
  page_no?: number;
  per_page?: number;
}

// Pagination response wrapper
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
