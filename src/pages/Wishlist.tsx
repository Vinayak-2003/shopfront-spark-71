import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useWishlist } from "@/contexts/WishlistContext";
import { Heart, ShoppingBag, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Wishlist() {
  const { items, clearWishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <Heart className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-6">
            Start shopping to add items to your wishlist
          </p>
          <Button variant="accent" onClick={() => navigate("/")}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Heart className="h-8 w-8 text-red-500" />
              Wishlist
            </h1>
            <p className="text-muted-foreground mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'} in your wishlist
            </p>
          </div>
          <Button variant="outline" onClick={clearWishlist}>
            <X className="h-4 w-4 mr-2" />
            Clear Wishlist
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((product) => (
            <div key={product.product_id} className="relative">
              <ProductCard product={product} />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background z-10"
                onClick={() => removeFromWishlist(product.product_id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}