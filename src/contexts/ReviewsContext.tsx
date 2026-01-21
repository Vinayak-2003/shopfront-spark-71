import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { Review, ReviewCreate, ProductReviewSummary } from "@/types/review";
import { useAuth } from "@/contexts/AuthContext";

interface ReviewsContextType {
  reviews: Review[];
  addReview: (reviewData: ReviewCreate) => void;
  updateReview: (reviewId: string, reviewData: Partial<ReviewCreate>) => void;
  deleteReview: (reviewId: string) => void;
  getProductReviews: (productId: string) => Review[];
  getProductReviewSummary: (productId: string) => ProductReviewSummary;
  getUserReview: (productId: string) => Review | undefined;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem("product_reviews");
    return saved ? JSON.parse(saved) : [];
  });
  const { user } = useAuth();

  // Sync reviews with local storage
  useEffect(() => {
    localStorage.setItem("product_reviews", JSON.stringify(reviews));
  }, [reviews]);

  const addReview = (reviewData: ReviewCreate) => {
    if (!user) {
      toast.error("Please sign in to leave a review");
      return;
    }

    // Check if user already reviewed this product
    const existingReview = reviews.find(
      r => r.user_id === user.user_id && r.product_id === reviewData.product_id
    );

    if (existingReview) {
      toast.error("You have already reviewed this product");
      return;
    }

    const newReview: Review = {
      id: Math.random().toString(36).substring(2, 9),
      product_id: reviewData.product_id,
      user_id: user.user_id,
      user_name: user.user_name || user.user_email.split("@")[0],
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setReviews(prev => [...prev, newReview]);
    toast.success("Review added successfully");
  };

  const updateReview = (reviewId: string, reviewData: Partial<ReviewCreate>) => {
    if (!user) {
      toast.error("Please sign in to update a review");
      return;
    }

    setReviews(prev => 
      prev.map(review => {
        if (review.id === reviewId && review.user_id === user.user_id) {
          const updatedReview = {
            ...review,
            ...reviewData,
            updated_at: new Date().toISOString(),
          };
          toast.success("Review updated successfully");
          return updatedReview;
        }
        return review;
      })
    );
  };

  const deleteReview = (reviewId: string) => {
    if (!user) {
      toast.error("Please sign in to delete a review");
      return;
    }

    setReviews(prev => {
      const review = prev.find(r => r.id === reviewId);
      if (review && review.user_id === user.user_id) {
        toast.success("Review deleted successfully");
        return prev.filter(r => r.id !== reviewId);
      } else {
        toast.error("You can only delete your own reviews");
        return prev;
      }
    });
  };

  const getProductReviews = (productId: string) => {
    return reviews.filter(review => review.product_id === productId);
  };

  const getProductReviewSummary = (productId: string): ProductReviewSummary => {
    const productReviews = reviews.filter(review => review.product_id === productId);
    
    if (productReviews.length === 0) {
      return {
        product_id: productId,
        average_rating: 0,
        total_reviews: 0,
        rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      };
    }

    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / productReviews.length;

    const ratingDistribution = {
      5: productReviews.filter(r => r.rating === 5).length,
      4: productReviews.filter(r => r.rating === 4).length,
      3: productReviews.filter(r => r.rating === 3).length,
      2: productReviews.filter(r => r.rating === 2).length,
      1: productReviews.filter(r => r.rating === 1).length,
    };

    return {
      product_id: productId,
      average_rating: parseFloat(averageRating.toFixed(1)),
      total_reviews: productReviews.length,
      rating_distribution: ratingDistribution
    };
  };

  const getUserReview = (productId: string) => {
    if (!user) return undefined;
    return reviews.find(
      review => review.user_id === user.user_id && review.product_id === productId
    );
  };

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        addReview,
        updateReview,
        deleteReview,
        getProductReviews,
        getProductReviewSummary,
        getUserReview
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error("useReviews must be used within ReviewsProvider");
  }
  return context;
}