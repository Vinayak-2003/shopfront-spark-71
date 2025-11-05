// Product type definitions for TypeScript type safety

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
  rating?: number;
  reviews?: number;
  features?: string[];
  specifications?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export interface ProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sortBy?: "price" | "name" | "created_at" | "rating";
  sortOrder?: "asc" | "desc";
}
