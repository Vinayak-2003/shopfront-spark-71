import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/lib/api";
import { Search, Filter } from "lucide-react";
import { Product, Category } from "@/types/product";
import { useState, useMemo } from "react";

export default function Products() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<Category | "">("");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [showFilters, setShowFilters] = useState(true); // Default open on products page

    // Fetch products from backend API
    const { data: productsData, isLoading, error, refetch } = useQuery({
        queryKey: ["all-products", searchTerm, selectedCategory, priceRange],
        queryFn: async () => {
            // Logic same as Index.tsx but maybe we always want 'all' or specific search
            if (searchTerm) {
                const results = await productsApi.searchByName(searchTerm, {
                    category: selectedCategory || undefined,
                    min_price: priceRange[0],
                    max_price: priceRange[1]
                });
                return { items: results, total: results.length };
            } else {
                const response = await productsApi.getAll(1, 100);
                let filteredProducts = response.items;

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

    const categories = useMemo(() => {
        if (!productsData?.items) return [];
        const uniqueCategories = [...new Set(productsData.items.map(p => p.category))] as Category[];
        return uniqueCategories;
    }, [productsData]);

    const products = productsData?.items || [];

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold">All Products</h1>
                    <p className="text-muted-foreground">
                        Showing {products.length} results
                    </p>
                </div>

                {/* Search and Filters */}
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
                                <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value as Category)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Categories" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Categories</SelectItem>
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

                {/* Products Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <ProductCard key={i} isLoading={true} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-bold text-red-500 mb-4">Error Loading Products</h2>
                        <Button onClick={() => refetch()}>Retry</Button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-xl text-muted-foreground">No products found fitting your criteria.</p>
                        <Button
                            variant="link"
                            onClick={() => {
                                setSelectedCategory("");
                                setPriceRange([0, 1000]);
                                setSearchTerm("");
                            }}
                        >
                            Clear all filters
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-slide-up">
                        {products.map((product: Product) => (
                            <ProductCard key={product.product_id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
