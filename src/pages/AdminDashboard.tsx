import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getProductImageUrl } from "@/lib/storage";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { productsApi } from "@/lib/api";
import { Product, ProductCreate, ProductUpdate, Category, Currency, ProductStatus } from "@/types/product";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductCreate>({
    product_name: "",
    description: "",
    price: 0,
    brand_id: "",
    category: "Men",
    image: ""
  });

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    } else if (user && user.role !== "admin" && user.role !== "seller") {
      toast.error("Access denied. Admin privileges required.");
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  // Fetch products
  useEffect(() => {
    if (user && (user.role === "admin" || user.role === "seller")) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.getAll(1, 100);
      setProducts(response.items);
      setFilteredProducts(response.items);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to fetch products";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product =>
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, products]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes("price") || name.includes("quantity")
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      product_name: "",
      description: "",
      price: 0,
      discount_price: 0,
      currency: "INR",
      available_quantity: 0,
      status: "Active",
      brand_id: "",
      category: "Men",
      image: ""
    });
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingProduct) {
        // Update existing product
        const updateData: ProductUpdate = {};

        // Compare each field and only include changed ones
        if (formData.product_name !== editingProduct.product_name) {
          updateData.product_name = formData.product_name || null;
        }
        if (formData.description !== editingProduct.description) {
          updateData.description = formData.description || null;
        }
        if (formData.price !== editingProduct.price) {
          updateData.price = formData.price || null;
        }
        if (formData.discount_price !== editingProduct.discount_price) {
          updateData.discount_price = formData.discount_price || null;
        }
        if (formData.currency !== editingProduct.currency) {
          updateData.currency = formData.currency || null;
        }
        if (formData.available_quantity !== editingProduct.available_quantity) {
          updateData.available_quantity = formData.available_quantity || null;
        }
        if (formData.status !== editingProduct.status) {
          updateData.status = formData.status || null;
        }
        if (formData.brand_id !== editingProduct.brand_id) {
          updateData.brand_id = formData.brand_id || null;
        }
        if (formData.category !== editingProduct.category) {
          updateData.category = formData.category || null;
        }
        if (formData.image !== editingProduct.image) {
          updateData.image = formData.image || null;
        }

        await productsApi.update(editingProduct.product_id, updateData);
        toast.success("Product updated successfully");
      } else {
        // Create new product
        await productsApi.create(formData);
        toast.success("Product created successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      fetchProducts();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save product";
      toast.error(message);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      product_name: product.product_name,
      description: product.description,
      price: product.price,
      discount_price: product.discount_price,
      currency: product.currency,
      available_quantity: product.available_quantity,
      status: product.status,
      brand_id: product.brand_id,
      category: product.category,
      image: product.image || ""
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await productsApi.delete(productId);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete product";
      toast.error(message);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <LoadingSpinner text="Loading dashboard..." />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your products and inventory</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Product Management</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProduct ? "Edit Product" : "Add New Product"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="product_name">Product Name *</Label>
                          <Input
                            id="product_name"
                            name="product_name"
                            value={formData.product_name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="image">Image Filename</Label>
                          <Input
                            id="image"
                            name="image"
                            placeholder="e.g., shoe.jpg"
                            value={formData.image || ""}
                            onChange={handleInputChange}
                          />
                          <p className="text-xs text-muted-foreground">
                            Upload file to Supabase 'product_images' bucket manually and paste filename here.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => handleSelectChange("category", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Men">Men</SelectItem>
                              <SelectItem value="Women">Women</SelectItem>
                              <SelectItem value="Kids">Kids</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="price">Price *</Label>
                          <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="discount_price">Discount Price</Label>
                          <Input
                            id="discount_price"
                            name="discount_price"
                            type="number"
                            step="0.01"
                            value={formData.discount_price}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="currency">Currency *</Label>
                          <Select
                            value={formData.currency}
                            onValueChange={(value) => handleSelectChange("currency", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INR">INR (₹)</SelectItem>
                              <SelectItem value="USD">USD ($)</SelectItem>
                              <SelectItem value="EURO">EUR (€)</SelectItem>
                              <SelectItem value="POUND STERLING">GBP (£)</SelectItem>
                              <SelectItem value="YEN">JPY (¥)</SelectItem>
                              <SelectItem value="RUSSIAN RUBLE">RUB (₽)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="available_quantity">Quantity *</Label>
                          <Input
                            id="available_quantity"
                            name="available_quantity"
                            type="number"
                            value={formData.available_quantity}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="brand_id">Brand ID *</Label>
                          <Input
                            id="brand_id"
                            name="brand_id"
                            value={formData.brand_id}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="status">Status *</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) => handleSelectChange("status", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Active">Active</SelectItem>
                              <SelectItem value="Inactive">Inactive</SelectItem>
                              <SelectItem value="Discontinued">Discontinued</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                          rows={4}
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsDialogOpen(false);
                            resetForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingProduct ? "Update Product" : "Create Product"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {searchTerm ? "No products match your search" : "No products found"}
                </p>
                {!searchTerm && (
                  <Button
                    className="mt-4"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Product
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.product_id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded bg-muted overflow-hidden">
                              {/* Use the new utility to display preview */}
                              <img
                                src={getProductImageUrl(product.image)}
                                alt={product.product_name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder-product.svg";
                                }}
                              />
                            </div>
                            <div>
                              <div className="font-medium">{product.product_name}</div>
                              <div className="text-sm text-muted-foreground">
                                {product.product_id.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {product.currency === "INR" ? "₹" :
                                product.currency === "USD" ? "$" :
                                  product.currency === "EURO" ? "€" :
                                    product.currency === "POUND STERLING" ? "£" :
                                      product.currency === "YEN" ? "¥" :
                                        product.currency === "RUSSIAN RUBLE" ? "₽" : "$"}
                              {product.price.toFixed(2)}
                            </div>
                            {product.discount_price > 0 && product.discount_price < product.price && (
                              <div className="text-sm text-muted-foreground line-through">
                                {product.currency === "INR" ? "₹" :
                                  product.currency === "USD" ? "$" :
                                    product.currency === "EURO" ? "€" :
                                      product.currency === "POUND STERLING" ? "£" :
                                        product.currency === "YEN" ? "¥" :
                                          product.currency === "RUSSIAN RUBLE" ? "₽" : "$"}
                                {product.price.toFixed(2)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{product.available_quantity}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${product.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : product.status === "Inactive"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                            }`}>
                            {product.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(product.product_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}