import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { cartApi } from "@/lib/api";
import { CartItemCreate, CartItemUpdate, CartItem } from "@/types/cart";
import { useAuth } from "@/contexts/AuthContext";

interface CartContextType {
  items: CartItem[] | null; // null indicates loading state
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  redirectToLogin: () => void; // New method to handle redirects
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[] | null>(null); // null indicates loading state
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  // Load cart from backend when component mounts
  // Only load cart if user is logged in
  useEffect(() => {
    if (!user) {
      setItems([]);
      setIsInitialized(true);
      return;
    }

    const loadCartFromBackend = async () => {
      try {
        // Try to load cart from backend
        const response = await cartApi.getAll();

        // Backend cart items only have IDs, we need to fetch product details
        const cartItemsPromises = response.items.map(async (item) => {
          try {
            const product = await import("@/lib/api").then(m => m.productsApi.getById(item.product_id));
            return {
              id: item.product_id,
              name: product.product_name,
              price: item.product_amount,
              currency: product.currency,
              image: product.image || "",
              quantity: item.quantity,
              cart_item_id: item.cart_item_id,
            };
          } catch (err) {
            console.error(`Failed to fetch product details for ${item.product_id}`, err);
            // Return a placeholder or null if product fetching fails
            return {
              id: item.product_id,
              name: "Product Unavailable",
              price: item.product_amount,
              currency: "INR",
              image: "",
              quantity: item.quantity,
              cart_item_id: item.cart_item_id,
            };
          }
        });

        const cartItems = await Promise.all(cartItemsPromises);
        setItems(cartItems);
        setIsInitialized(true);
      } catch (error) {
        console.warn("Failed to load cart from backend, using local storage:", error);
        // Fall back to local storage if backend fails
        const saved = localStorage.getItem("cart");
        if (saved) {
          setItems(JSON.parse(saved));
        } else {
          setItems([]); // Initialize with empty array if no local storage
        }
        setIsInitialized(true);
      }
    };

    loadCartFromBackend();
  }, [user]); // Add user dependency to reload when auth state changes

  // Sync cart with local storage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("cart", JSON.stringify(items));
    }
  }, [items, isInitialized]);

  // Function to redirect to login - will be called from components that have router context
  const redirectToLogin = () => {
    // Store the current location in localStorage so user can be redirected back after login
    if (typeof window !== 'undefined') {
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      window.location.href = '/auth';
    }
  };

  const addItem = async (item: Omit<CartItem, "quantity">) => {
    // Check authentication but defer navigation to components with router context
    if (!user) {
      toast.info("Please sign in to add items to your cart");
      redirectToLogin();
      return;
    }

    try {
      // Try to add item to backend cart
      const cartItemCreate: CartItemCreate = {
        product_id: item.id,
        quantity: 1
      };

      const cartItemOut = await cartApi.addItem(cartItemCreate);

      // Convert CartItemOut to CartItem
      const newCartItem: CartItem = {
        id: cartItemOut.product_id,
        name: item.name,
        price: cartItemOut.product_amount,
        currency: item.currency || "INR",
        image: item.image,
        quantity: cartItemOut.quantity,
        cart_item_id: cartItemOut.cart_item_id, // Store the cart_item_id
      };

      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          toast.success("Updated cart quantity");
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        toast.success("Added to cart");
        return [...prev, newCartItem];
      });
    } catch (error) {
      console.warn("Failed to add item to backend cart:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to add item to cart. Please try again.";
      toast.error(errorMessage);
      // Fall back to local storage
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          toast.success("Updated cart quantity");
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          );
        }
        toast.success("Added to cart");
        return [...prev, { ...item, quantity: 1, currency: item.currency || "INR" }];
      });
    }
  };

  const removeItem = async (id: string) => {
    // Check authentication but defer navigation to components with router context
    if (!user) {
      toast.info("Please sign in to manage your cart");
      redirectToLogin();
      return;
    }

    try {
      // Try to remove item from backend cart
      // We need to find the cart item ID first
      const cartItem = items.find(item => item.id === id);
      if (cartItem && cartItem.cart_item_id) {
        // Remove from backend using cart_item_id
        await cartApi.removeItem(cartItem.cart_item_id);
      } else {
        console.warn("Removing item from local cart only - cart_item_id not available");
      }

      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Removed from cart");
    } catch (error) {
      console.warn("Failed to remove item from backend cart:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to remove item from cart. Please try again.";
      toast.error(errorMessage);
      // Fall back to local storage
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success("Removed from cart");
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    // Check authentication but defer navigation to components with router context
    if (!user) {
      toast.info("Please sign in to manage your cart");
      redirectToLogin();
      return;
    }

    if (quantity <= 0) {
      await removeItem(id);
      return;
    }

    try {
      // Try to update item quantity in backend cart
      // We need to find the cart item ID first
      const cartItem = items.find(item => item.id === id);
      if (cartItem && cartItem.cart_item_id) {
        // Update in backend using cart_item_id
        const cartItemUpdate: CartItemUpdate = { quantity };
        await cartApi.updateItem(cartItem.cart_item_id, cartItemUpdate);
      } else {
        console.warn("Updating item in local cart only - cart_item_id not available");
      }

      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    } catch (error) {
      console.warn("Failed to update item quantity in backend cart:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to update item quantity. Please try again.";
      toast.error(errorMessage);
      // Fall back to local storage
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    }
  };

  const clearCart = async () => {
    // Check authentication but defer navigation to components with router context
    if (!user) {
      toast.info("Please sign in to manage your cart");
      redirectToLogin();
      return;
    }

    try {
      // Try to clear backend cart by removing all items
      const removePromises = items
        .filter(item => item.cart_item_id)
        .map(item => cartApi.removeItem(item.cart_item_id!));

      if (removePromises.length > 0) {
        await Promise.all(removePromises);
      }

      setItems([]);
      toast.success("Cart cleared");
    } catch (error) {
      console.warn("Failed to clear backend cart:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to clear cart. Please try again.";
      toast.error(errorMessage);
      // Fall back to local storage
      setItems([]);
      toast.success("Cart cleared");
    }
  };

  const total = items ? items.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;
  const itemCount = items ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <CartContext.Provider
      value={{ items, addItem: addItem as any, removeItem: removeItem as any, updateQuantity: updateQuantity as any, clearCart: clearCart as any, total, itemCount, redirectToLogin }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}