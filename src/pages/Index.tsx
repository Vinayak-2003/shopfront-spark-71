import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import { ArrowRight, ShieldCheck, Truck, CreditCard, Search, Filter } from "lucide-react";
import { Product, Category } from "@/types/product";
import { useState, useMemo } from "react";

// Placeholder for hero banner - you can add your own image
const heroBannerUrl = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=2000&q=80";

export default function Index() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "">("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products from backend API
  const { data: productsData, isLoading, error, refetch } = useQuery({
    queryKey: ["products", searchTerm, selectedCategory, priceRange],
    queryFn: async () => {
      if (searchTerm) {
        // Use search API when there's a search term
        const results = await productsApi.searchByName(searchTerm, {
          category: selectedCategory || undefined,
          min_price: priceRange[0],
          max_price: priceRange[1]
        });
        return { items: results, total: results.length };
      } else {
        // Use getAll API for general browsing
        const response = await productsApi.getAll(1, 100);
        let filteredProducts = response.items;

        // Apply client-side filters
        if (selectedCategory) {
          filteredProducts = filteredProducts.filter(p => p.category === selectedCategory);
        }

        if (priceRange[0] > 0 || priceRange[1] < 1000) {
          filteredProducts = filteredProducts.filter(p => {
            const displayPrice = p.discount_price > 0 ? p.discount_price : p.price;
            return displayPrice >= priceRange[0] && displayPrice <= priceRange[1];
          });
        }

        return { items: filteredProducts, total: filteredProducts.length };
      }
    },
  });

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    if (!productsData?.items) return [];
    const uniqueCategories = [...new Set(productsData.items.map(p => p.category))] as Category[];
    return uniqueCategories;
  }, [productsData]);

  // Show skeleton loaders while loading
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl">
              <div className="h-20 bg-muted rounded mb-6 animate-pulse"></div>
              <div className="h-6 bg-muted rounded mb-8 animate-pulse w-3/4"></div>
              <div className="h-12 bg-muted rounded w-48 animate-pulse"></div>
            </div>
          </div>
        </section>

        <section className="py-12 border-b bg-gradient-to-b from-background to-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-6 rounded-lg bg-card border">
                  <div className="p-3 rounded-full bg-muted animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2 animate-pulse"></div>
                    <div className="h-3 bg-muted rounded w-3/4 animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-8">
          {/* Search and Filters */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <div className="h-10 bg-muted rounded pl-10 animate-pulse"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
              <div className="h-10 w-10 bg-muted rounded animate-pulse"></div>
            </div>
          </div>

          {/* Filter Panel */}
          <div className="mb-8 p-4 bg-card border rounded-lg animate-pulse">
            <div className="h-6 bg-muted rounded w-32 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
              <div>
                <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
              <div>
                <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                <div className="h-10 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16">
          <div className="mb-12 text-center">
            <div className="h-10 bg-muted rounded w-64 mx-auto mb-3 animate-pulse"></div>
            <div className="h-5 bg-muted rounded w-80 mx-auto animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCard key={i} isLoading={true} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Products</h2>
          <p className="text-muted-foreground">
            {error instanceof Error ? error.message : "Failed to load products"}
          </p>
          <Button onClick={() => refetch()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const products = productsData?.items || [];

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroBannerUrl}
            alt="Shop the latest products"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl animate-fade-in pl-4 md:pl-0">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent drop-shadow-sm">
              Discover Premium Products
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Shop the latest collection of tech and lifestyle essentials. Quality you can trust, prices you'll love.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all text-lg px-8 py-6"
            >
              Shop Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 border-b bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4 p-6 rounded-xl bg-card border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Free Shipping</h3>
                <p className="text-sm text-muted-foreground">On all orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-xl bg-card border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <div className="p-3 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <ShieldCheck className="h-6 w-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure Payment</h3>
                <p className="text-sm text-muted-foreground">100% secure transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 rounded-xl bg-card border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Easy Returns</h3>
                <p className="text-sm text-muted-foreground">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mb-8 p-4 bg-card border rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as Category | "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Price Range: ${priceRange[0]} - ${priceRange[1]}
                </label>
                <Slider
                  min={0}
                  max={1000}
                  step={10}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="mt-2"
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedCategory("");
                    setPriceRange([0, 1000]);
                    setSearchTerm("");
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Products Grid */}
      <section className="container mx-auto px-4 pb-16">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent inline-block">
            {searchTerm ? `Search Results for "${searchTerm}"` : "Featured Products"}
          </h2>
          <p className="text-lg text-muted-foreground">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">No products found matching your criteria</p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory("");
                setPriceRange([0, 1000]);
                setSearchTerm("");
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
            {products.map((product: Product) => (
              <ProductCard key={product.product_id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}