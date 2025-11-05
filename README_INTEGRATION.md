# FastAPI Backend Integration Guide

This guide explains how to integrate your FastAPI backend with this React e-commerce frontend.

## Table of Contents
1. [Overview](#overview)
2. [API Endpoints Required](#api-endpoints-required)
3. [Configuration](#configuration)
4. [Integration Steps](#integration-steps)
5. [Example FastAPI Implementation](#example-fastapi-implementation)

## Overview

The frontend is built with React + TypeScript and is ready to connect to your FastAPI backend. All API calls are centralized in `/src/lib/api.ts` for easy management.

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **State Management**: React Context API
- **HTTP Client**: Native Fetch API
- **Authentication**: Supabase Auth (can be replaced with custom auth)

## API Endpoints Required

Your FastAPI backend should implement these endpoints:

### Products
```
GET    /api/products              - Get all products
GET    /api/products/{id}         - Get product by ID
GET    /api/products?search=...   - Search products
GET    /api/products?category=... - Filter by category
```

### Cart (Optional - if using backend cart)
```
GET    /api/cart                  - Get user's cart
POST   /api/cart/items            - Add item to cart
PATCH  /api/cart/items/{id}       - Update item quantity
DELETE /api/cart/items/{id}       - Remove item from cart
DELETE /api/cart                  - Clear entire cart
```

### Orders
```
GET    /api/orders                - Get user's orders
GET    /api/orders/{id}           - Get order by ID
POST   /api/orders                - Create new order
```

### Payments
```
POST   /api/checkout              - Process checkout
POST   /api/payments/intent       - Create payment intent
```

### Authentication (Optional - if not using Supabase)
```
POST   /api/auth/login            - User login
POST   /api/auth/register         - User registration
POST   /api/auth/logout           - User logout
GET    /api/auth/me               - Get current user
```

## Configuration

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
# FastAPI Backend URL
VITE_API_BASE_URL=http://localhost:8000

# Or for production
# VITE_API_BASE_URL=https://your-api-domain.com
```

### 2. Update API Configuration

Edit `/src/config/api.ts` to match your backend endpoints if they differ from the defaults.

## Integration Steps

### Step 1: Set Up Environment Variables

```bash
# Copy example env file
cp .env.example .env.local

# Update with your backend URL
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local
```

### Step 2: Update Products to Use API

Replace the mock data in `/src/pages/Index.tsx`:

```typescript
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function Index() {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: productsApi.getAll,
  });

  if (isLoading) return <LoadingSpinner text="Loading products..." />;
  if (error) return <div>Error loading products</div>;

  // Rest of your component...
}
```

### Step 3: Update Cart to Use API (Optional)

If you want to use a backend cart instead of localStorage, update `/src/contexts/CartContext.tsx`:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "@/lib/api";

// Replace localStorage logic with API calls
const { data: cartData } = useQuery({
  queryKey: ["cart"],
  queryFn: cartApi.get,
});

const addItemMutation = useMutation({
  mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
    cartApi.addItem(id, quantity),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  },
});
```

### Step 4: Update Checkout to Use API

Update `/src/pages/Checkout.tsx` to call your payment endpoint:

```typescript
import { paymentsApi } from "@/lib/api";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    const result = await paymentsApi.checkout({
      cart_items: items,
      payment_method: {
        card_number: formData.cardNumber,
        card_name: formData.cardName,
        expiry: formData.expiry,
        cvv: formData.cvv,
      },
      billing_address: {
        address: formData.address,
        city: formData.city,
        zip: formData.zip,
      },
    });
    
    if (result.success) {
      toast.success("Order placed successfully!");
      clearCart();
      navigate("/");
    }
  } catch (error) {
    toast.error("Payment failed. Please try again.");
  } finally {
    setLoading(false);
  }
};
```

## Example FastAPI Implementation

Here's a minimal FastAPI backend to get you started:

```python
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your React app URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Product(BaseModel):
    id: str
    name: str
    price: float
    description: str
    image: str
    category: str
    stock: int

class CartItem(BaseModel):
    id: str
    name: str
    price: float
    image: str
    quantity: int

# Endpoints
@app.get("/api/products", response_model=List[Product])
async def get_products():
    # Replace with your database query
    return [
        {
            "id": "1",
            "name": "Premium Headphones",
            "price": 299.99,
            "description": "High-quality wireless headphones",
            "image": "/images/product1.jpg",
            "category": "Audio",
            "stock": 15
        }
    ]

@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    # Replace with your database query
    pass

@app.post("/api/checkout")
async def checkout(data: dict):
    # Implement your payment logic
    return {
        "success": True,
        "order_id": "ORDER123",
        "message": "Order placed successfully"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Testing the Integration

1. **Start your FastAPI backend**:
```bash
uvicorn main:app --reload
```

2. **Start the React frontend**:
```bash
npm run dev
```

3. **Test API calls**:
   - Open browser console
   - Navigate through the app
   - Check Network tab for API requests
   - Verify responses

## Error Handling

The frontend includes built-in error handling:

- **Network Errors**: Displayed via toast notifications
- **Loading States**: Loading spinners for better UX
- **Error Boundaries**: Catches React errors gracefully
- **Timeout**: 30-second timeout for API requests

## Authentication

Currently using Supabase for auth. To use custom auth:

1. Update `/src/contexts/AuthContext.tsx`
2. Replace Supabase auth calls with `authApi` from `/src/lib/api.ts`
3. Store JWT token in localStorage
4. Token is automatically included in API headers

## Need Help?

Check these files for reference:
- `/src/config/api.ts` - API configuration
- `/src/lib/api.ts` - API service functions
- `/src/types/` - TypeScript type definitions
- `/src/contexts/` - State management

For FastAPI documentation: https://fastapi.tiangolo.com/
