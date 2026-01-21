// Review type definitions

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  user_name: string;
  rating: number; // 1-5 stars
  title: string;
  comment: string;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface ReviewCreate {
  product_id: string;
  rating: number;
  title: string;
  comment: string;
}

export interface ReviewUpdate {
  rating?: number;
  title?: string;
  comment?: string;
}

export interface ProductReviewSummary {
  product_id: string;
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}