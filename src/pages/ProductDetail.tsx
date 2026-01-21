import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { useReviews } from "@/contexts/ReviewsContext";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingCart, ArrowLeft, Package, Star, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Product } from "@/types/product";
import { getProductImageUrl } from "@/lib/storage";
import Skeleton from "@/components/Skeleton";
import RatingStars from "@/components/RatingStars";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { getProductReviews, getProductReviewSummary, addReview, getUserReview } = useReviews();
  const { user } = useAuth();
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(0);

  // Fetch product by ID from backend
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => productsApi.getById(id!),
    enabled: !!id,
  });

  // Get product reviews and summary
  const productReviews = product ? getProductReviews(product.product_id) : [];
  const reviewSummary = product ? getProductReviewSummary(product.product_id) : null;
  const userReview = product ? getUserReview(product.product_id) : null;

  // Map currency to symbol
  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      INR: "₹",
      USD: "$",
      EURO: "€",
      "POUND STERLING": "£",
      YEN: "¥",
      "RUSSIAN RUBLE": "₽",
    };
    return symbols[currency] || "$";
  };

  const handleSubmitReview = () => {
    if (!product || !user) return;

    if (reviewRating === 0) {
      alert("Please select a rating");
      return;
    }

    if (!reviewTitle.trim()) {
      alert("Please enter a review title");
      return;
    }

    if (!reviewComment.trim()) {
      alert("Please enter your review comment");
      return;
    }

    addReview({
      product_id: product.product_id,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment
    });

    // Reset form
    setReviewTitle("");
    setReviewComment("");
    setReviewRating(0);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-8 mobile-padding">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Shop
          </Button>

          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-12 items-start grid-gap-mobile">
            <div className="aspect-square overflow-hidden rounded-lg bg-muted">
              <Skeleton className="w-full h-full" />
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-12 w-3/4 mb-4" />

              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>

              <div className="flex items-center gap-2 text-muted-foreground">
                <Package className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>

              <div className="prose prose-slate max-w-none">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/5" />
              </div>

              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>

              <div className="border-t pt-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center mobile-padding">
          <h1 className="text-2xl font-bold mb-4 text-red-500">
            {error ? "Error Loading Product" : "Product not found"}
          </h1>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : "The product you're looking for doesn't exist."}
          </p>
          <Button onClick={() => navigate("/")}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  // Display discounted price or regular price
  const displayPrice = product.discount_price > 0 ? product.discount_price : product.price;
  const hasDiscount = product.discount_price > 0 && product.discount_price < product.price;
  const isAvailable = product.available_quantity > 0 && product.status === "Active";

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mobile-padding">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Button>

        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-12 items-start grid-gap-mobile">
          <div className="aspect-square overflow-hidden rounded-lg bg-muted">
            <img
              src={getProductImageUrl(product.image, { width: 800, quality: 90 })}
              alt={product.product_name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-product.svg";
              }}
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <Badge variant="secondary">
                  {product.category}
                </Badge>
                {product.status !== "Active" && (
                  <Badge variant="destructive">
                    {product.status}
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge className="bg-red-500">
                    {Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold mb-2 heading-responsive">{product.product_name}</h1>

              {/* Rating Summary */}
              {reviewSummary && reviewSummary.total_reviews > 0 && (
                <div className="flex items-center gap-4 mb-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{reviewSummary.average_rating}</span>
                    <RatingStars rating={reviewSummary.average_rating} size="sm" />
                  </div>
                  <span className="text-muted-foreground">
                    ({reviewSummary.total_reviews} {reviewSummary.total_reviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <p className="text-3xl font-bold text-accent">
                  {getCurrencySymbol(product.currency)}{displayPrice.toFixed(2)}
                </p>
                {hasDiscount && (
                  <p className="text-xl text-muted-foreground line-through">
                    {getCurrencySymbol(product.currency)}{product.price.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>
                {product.available_quantity > 0
                  ? `${product.available_quantity} in stock`
                  : "Out of stock"}
              </span>
            </div>

            <div className="prose prose-slate max-w-none">
              <p className="text-lg text-responsive">{product.description}</p>
            </div>

            <div className="space-y-3">
              <Button
                variant="accent"
                size="lg"
                className="w-full btn-responsive"
                disabled={!isAvailable}
                onClick={async () => {
                  await addItem({
                    id: product.product_id,
                    name: product.product_name,
                    price: displayPrice,
                    image: product.image || "",
                  });
                }}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isAvailable ? "Add to Cart" : "Unavailable"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full btn-responsive"
                disabled={!isAvailable}
                onClick={async () => {
                  await addItem({
                    id: product.product_id,
                    name: product.product_name,
                    price: displayPrice,
                    image: product.image || "",
                  });
                  navigate("/cart");
                }}
              >
                Buy Now
              </Button>
            </div>

            {/* Additional product info */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Product Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between flex-wrap">
                  <dt className="text-muted-foreground">Brand ID:</dt>
                  <dd className="font-medium">{product.brand_id}</dd>
                </div>
                <div className="flex justify-between flex-wrap">
                  <dt className="text-muted-foreground">Currency:</dt>
                  <dd className="font-medium">{product.currency}</dd>
                </div>
                <div className="flex justify-between flex-wrap">
                  <dt className="text-muted-foreground">Status:</dt>
                  <dd className="font-medium">{product.status}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 heading-responsive">Customer Reviews</h2>

          {/* Review Summary */}
          {reviewSummary && reviewSummary.total_reviews > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 grid-gap-mobile">
              <Card className="shadow-transition hover-lift">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    Overall Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">{reviewSummary.average_rating}</div>
                    <RatingStars rating={reviewSummary.average_rating} size="lg" className="justify-center" />
                    <p className="text-muted-foreground mt-2">
                      Based on {reviewSummary.total_reviews} {reviewSummary.total_reviews === 1 ? 'review' : 'reviews'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 shadow-transition hover-lift">
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="w-8 text-sm">{stars}★</span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400"
                            style={{ width: `${(reviewSummary.rating_distribution[stars as keyof typeof reviewSummary.rating_distribution] / reviewSummary.total_reviews) * 100}%` }}
                          ></div>
                        </div>
                        <span className="w-12 text-right text-sm text-muted-foreground">
                          {reviewSummary.rating_distribution[stars as keyof typeof reviewSummary.rating_distribution]}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Add Review Form */}
          {user && !userReview && (
            <Card className="mb-12 shadow-transition hover-lift">
              <CardHeader>
                <CardTitle>Write a Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 form-stack">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Rating</label>
                    <RatingStars
                      rating={reviewRating}
                      size="lg"
                      interactive={true}
                      onRatingChange={setReviewRating}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Title</label>
                    <Input
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="Give your review a title"
                      className="touch-target"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Review</label>
                    <Textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your thoughts about this product"
                      rows={4}
                      className="touch-target"
                    />
                  </div>

                  <Button
                    onClick={handleSubmitReview}
                    disabled={reviewRating === 0 || !reviewTitle.trim() || !reviewComment.trim()}
                    className="btn-responsive"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Submit Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {userReview && (
            <Card className="mb-12 shadow-transition hover-lift">
              <CardHeader>
                <CardTitle>Your Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <RatingStars rating={userReview.rating} size="sm" />
                      <span className="font-medium">{userReview.title}</span>
                    </div>
                    <p className="text-muted-foreground text-sm mb-2">
                      By {userReview.user_name} • {new Date(userReview.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-responsive">{userReview.comment}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews List */}
          {productReviews.length > 0 ? (
            <div className="space-y-6 card-stack">
              {productReviews.map((review) => (
                <Card key={review.id} className="shadow-transition hover-lift">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <RatingStars rating={review.rating} size="sm" />
                          <span className="font-medium">{review.title}</span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-2">
                          By {review.user_name} • {new Date(review.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-responsive">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Star className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground">
                Be the first to review this product
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}