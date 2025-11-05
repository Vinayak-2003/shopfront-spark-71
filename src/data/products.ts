import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 299.99,
    description: "High-quality wireless headphones with active noise cancellation and 30-hour battery life. Experience superior sound quality with deep bass and crystal-clear highs.",
    image: product1,
    category: "Audio",
    stock: 15,
  },
  {
    id: "2",
    name: "Smart Watch Pro",
    price: 399.99,
    description: "Advanced smartwatch with health tracking, GPS, and seamless connectivity. Monitor your fitness goals and stay connected on the go.",
    image: product2,
    category: "Wearables",
    stock: 22,
  },
  {
    id: "3",
    name: "Ultra-Slim Laptop",
    price: 1299.99,
    description: "Powerful laptop with stunning display and all-day battery life. Perfect for professionals and creators who demand performance.",
    image: product3,
    category: "Computers",
    stock: 8,
  },
  {
    id: "4",
    name: "Professional Camera",
    price: 1899.99,
    description: "Professional-grade camera with advanced features for stunning photography. Capture life's moments in incredible detail.",
    image: product4,
    category: "Photography",
    stock: 5,
  },
];
