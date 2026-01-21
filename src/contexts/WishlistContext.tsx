import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { Product } from "@/types/product";

interface WishlistContextType {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => {
    const saved = localStorage.getItem("wishlist");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync wishlist with local storage
  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(items));
  }, [items]);

  const addToWishlist = (product: Product) => {
    setItems((prev) => {
      if (prev.some(item => item.product_id === product.product_id)) {
        toast.info("Product already in wishlist");
        return prev;
      }
      toast.success("Added to wishlist");
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setItems((prev) => prev.filter(item => item.product_id !== productId));
    toast.success("Removed from wishlist");
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.product_id === productId);
  };

  const clearWishlist = () => {
    setItems([]);
    toast.success("Wishlist cleared");
  };

  const itemCount = items.length;

  return (
    <WishlistContext.Provider
      value={{ items, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist, itemCount }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}