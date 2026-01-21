import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useReviews } from "@/contexts/ReviewsContext";
import { Product } from "@/types/product";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { getProductImageUrl } from "@/lib/storage";
import Skeleton from "@/components/Skeleton";
import RatingStars from "@/components/RatingStars";

interface ProductCardProps {
  product?: Product;
  isLoading?: boolean;
}

export default function ProductCard({ product, isLoading }: ProductCardProps) {
  const { addItem } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { getProductReviewSummary } = useReviews();

  if (isLoading || !product) {
    return (
      <Card className="overflow-hidden product-card-mobile">
        <div className="aspect-square overflow-hidden bg-muted">
          <Skeleton className="h-full w-full" />
        </div>
        <CardContent className="p-4 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-1/3" />
        </CardContent>
        <CardFooter className="p-4 pt-0">
          <Skeleton className="h-10 w-full" />
        </CardFooter>
      </Card>
    );
  }

  // Display discounted price or regular price
  const displayPrice = product.discount_price > 0 ? product.discount_price : product.price;
  const hasDiscount = product.discount_price > 0 && product.discount_price < product.price;
  const isWishlisted = isInWishlist(product.product_id);

  // Get product review summary
  const reviewSummary = getProductReviewSummary(product.product_id);
  const averageRating = reviewSummary.average_rating;
  const totalReviews = reviewSummary.total_reviews;

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

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.product_id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 shadow-sm border-border/50 product-card-mobile">
      <Link to={`/product/${product.product_id}`}>
        <div className="aspect-square overflow-hidden bg-muted relative">
          <img
            src={getProductImageUrl(product.image, { width: 400, quality: 80 })}
            alt={product.product_name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-product.svg";
            }}
          />
          {product.discount_price > 0 && product.discount_price < product.price && (
            <Badge className="absolute top-2 right-2 bg-red-500 badge-mobile">
              {Math.round(((product.price - product.discount_price) / product.price) * 100)}% OFF
            </Badge>
          )}
          {product.status !== "Active" && (
            <Badge variant="secondary" className="absolute top-2 left-2 badge-mobile">
              {product.status}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm hover:bg-background touch-target"
            onClick={(e) => {
              e.preventDefault();
              handleWishlistToggle();
            }}
          >
            <Heart
              className={`h-5 w-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-foreground'}`}
            />
          </Button>
        </div>
      </Link>
      <CardContent className="p-4">
        <Link to={`/product/${product.product_id}`}>
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 hover:text-accent transition-colors text-nowrap-xs">
            {product.product_name}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-2">{product.category}</p>

        {/* Rating */}
        {totalReviews > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <RatingStars rating={averageRating} size="sm" />
            <span className="text-sm font-medium text-nowrap-xs">
              {averageRating} ({totalReviews})
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold">
            {getCurrencySymbol(product.currency)}{displayPrice.toFixed(2)}
          </p>
          {hasDiscount && (
            <p className="text-sm text-muted-foreground line-through">
              {getCurrencySymbol(product.currency)}{product.price.toFixed(2)}
            </p>
          )}
        </div>
        {product.available_quantity > 0 && product.available_quantity <= 10 && (
          <p className="text-xs text-orange-500 mt-1">
            Only {product.available_quantity} left!
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full btn-responsive touch-target bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
          disabled={product.available_quantity === 0 || product.status !== "Active"}
          onClick={async (e) => {
            e.preventDefault();
            await addItem({
              id: product.product_id,
              name: product.product_name,
              price: displayPrice,
              image: product.image || "",
            });
          }}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.available_quantity === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
}