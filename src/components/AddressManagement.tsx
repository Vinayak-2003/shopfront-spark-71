import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { addressApi } from "@/lib/api";
import { Address, AddressCreate, AddressUpdate, AddressType } from "@/types/address";
import { MapPin, Plus, Edit2, Trash2, Home, Building2, MapPinned, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "./LoadingSpinner";

interface AddressManagementProps {
  onAddressCountChange?: (count: number) => void;
}

export default function AddressManagement({ onAddressCountChange }: AddressManagementProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<AddressCreate>({
    address_type: "home",
    receiver_name: "",
    receiver_email: "",
    receiver_contact: "",
    address_line_1: "",
    address_line_2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    is_default: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressApi.getAll();
      setAddresses(data);
      onAddressCountChange?.(data.length);
    } catch (error) {
      toast.error("Failed to load addresses");
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      address_type: "home",
      receiver_name: "",
      receiver_email: "",
      receiver_contact: "",
      address_line_1: "",
      address_line_2: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      country: "",
      is_default: false,
    });
    setErrors({});
    setEditingAddress(null);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.receiver_name.trim()) {
      newErrors.receiver_name = "Receiver name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.receiver_email.trim()) {
      newErrors.receiver_email = "Email is required";
    } else if (!emailRegex.test(formData.receiver_email)) {
      newErrors.receiver_email = "Invalid email format";
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!formData.receiver_contact.trim()) {
      newErrors.receiver_contact = "Contact number is required";
    } else if (!phoneRegex.test(formData.receiver_contact)) {
      newErrors.receiver_contact = "Invalid phone format (e.g., +1234567890)";
    }

    if (!formData.address_line_1.trim()) {
      newErrors.address_line_1 = "Address line 1 is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setSubmitting(true);
    try {
      if (editingAddress) {
        // Update existing address
        await addressApi.update(editingAddress.address_id, formData);
        toast.success("Address updated successfully");
      } else {
        // Create new address
        await addressApi.create(formData);
        toast.success("Address added successfully");
      }

      await fetchAddresses();
      setDialogOpen(false);
      resetForm();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to save address";
      toast.error(message);
      console.error("Error saving address:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      address_type: address.address_type,
      receiver_name: address.receiver_name,
      receiver_email: address.receiver_email,
      receiver_contact: address.receiver_contact,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2 || "",
      landmark: address.landmark || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
      is_default: address.is_default,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      await addressApi.delete(addressId);
      toast.success("Address deleted successfully");
      await fetchAddresses();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to delete address";
      toast.error(message);
      console.error("Error deleting address:", error);
    }
  };

  const getAddressIcon = (type: AddressType) => {
    switch (type) {
      case "home":
        return <Home className="h-4 w-4" />;
      case "office":
        return <Building2 className="h-4 w-4" />;
      default:
        return <MapPinned className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => {
      setDialogOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <MapPin className="mr-2 h-4 w-4" />
          Manage Addresses ({addresses.length})
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {editingAddress ? "Edit Address" : "Manage Addresses"}
          </DialogTitle>
          <DialogDescription>
            {editingAddress
              ? "Update your delivery address details"
              : "View, add, edit, or delete your saved addresses"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-8">
              <LoadingSpinner text="Loading addresses..." />
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Address List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Saved Addresses</h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      resetForm();
                      setDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add New
                  </Button>
                </div>

                {addresses.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No addresses saved yet. Add your first address to get started.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {addresses.map((address) => (
                        <Card key={address.address_id} className={address.is_default ? "border-primary" : ""}>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getAddressIcon(address.address_type)}
                                <span className="capitalize">{address.address_type}</span>
                                {address.is_default && (
                                  <Badge variant="default" className="text-xs">Default</Badge>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7"
                                  onClick={() => handleEdit(address)}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => handleDelete(address.address_id)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="text-sm space-y-1">
                            <p className="font-medium">{address.receiver_name}</p>
                            <p className="text-muted-foreground">{address.address_line_1}</p>
                            {address.address_line_2 && (
                              <p className="text-muted-foreground">{address.address_line_2}</p>
                            )}
                            {address.landmark && (
                              <p className="text-muted-foreground">Landmark: {address.landmark}</p>
                            )}
                            <p className="text-muted-foreground">
                              {address.city}, {address.state} - {address.pincode}
                            </p>
                            <p className="text-muted-foreground">{address.country}</p>
                            <p className="text-muted-foreground">📞 {address.receiver_contact}</p>
                            <p className="text-muted-foreground">✉️ {address.receiver_email}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Add/Edit Form */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-4">
                  {editingAddress ? "Edit Address" : "Add New Address"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {/* Address Type */}
                      <div className="space-y-2">
                        <Label htmlFor="address_type">Address Type *</Label>
                        <Select
                          value={formData.address_type}
                          onValueChange={(value: AddressType) =>
                            setFormData({ ...formData, address_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select address type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="home">Home</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Receiver Name */}
                      <div className="space-y-2">
                        <Label htmlFor="receiver_name">Receiver Name *</Label>
                        <Input
                          id="receiver_name"
                          value={formData.receiver_name}
                          onChange={(e) =>
                            setFormData({ ...formData, receiver_name: e.target.value })
                          }
                          className={errors.receiver_name ? "border-destructive" : ""}
                        />
                        {errors.receiver_name && (
                          <p className="text-sm text-destructive">{errors.receiver_name}</p>
                        )}
                      </div>

                      {/* Receiver Email */}
                      <div className="space-y-2">
                        <Label htmlFor="receiver_email">Receiver Email *</Label>
                        <Input
                          id="receiver_email"
                          type="email"
                          value={formData.receiver_email}
                          onChange={(e) =>
                            setFormData({ ...formData, receiver_email: e.target.value })
                          }
                          className={errors.receiver_email ? "border-destructive" : ""}
                        />
                        {errors.receiver_email && (
                          <p className="text-sm text-destructive">{errors.receiver_email}</p>
                        )}
                      </div>

                      {/* Receiver Contact */}
                      <div className="space-y-2">
                        <Label htmlFor="receiver_contact">Receiver Contact *</Label>
                        <Input
                          id="receiver_contact"
                          placeholder="+1234567890"
                          value={formData.receiver_contact}
                          onChange={(e) =>
                            setFormData({ ...formData, receiver_contact: e.target.value })
                          }
                          className={errors.receiver_contact ? "border-destructive" : ""}
                        />
                        {errors.receiver_contact && (
                          <p className="text-sm text-destructive">{errors.receiver_contact}</p>
                        )}
                      </div>

                      {/* Address Line 1 */}
                      <div className="space-y-2">
                        <Label htmlFor="address_line_1">Address Line 1 *</Label>
                        <Input
                          id="address_line_1"
                          value={formData.address_line_1}
                          onChange={(e) =>
                            setFormData({ ...formData, address_line_1: e.target.value })
                          }
                          className={errors.address_line_1 ? "border-destructive" : ""}
                        />
                        {errors.address_line_1 && (
                          <p className="text-sm text-destructive">{errors.address_line_1}</p>
                        )}
                      </div>

                      {/* Address Line 2 */}
                      <div className="space-y-2">
                        <Label htmlFor="address_line_2">Address Line 2</Label>
                        <Input
                          id="address_line_2"
                          value={formData.address_line_2 || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, address_line_2: e.target.value })
                          }
                        />
                      </div>

                      {/* Landmark */}
                      <div className="space-y-2">
                        <Label htmlFor="landmark">Landmark</Label>
                        <Input
                          id="landmark"
                          value={formData.landmark || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, landmark: e.target.value })
                          }
                        />
                      </div>

                      {/* City, State, Pincode */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) =>
                              setFormData({ ...formData, city: e.target.value })
                            }
                            className={errors.city ? "border-destructive" : ""}
                          />
                          {errors.city && (
                            <p className="text-sm text-destructive">{errors.city}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) =>
                              setFormData({ ...formData, state: e.target.value })
                            }
                            className={errors.state ? "border-destructive" : ""}
                          />
                          {errors.state && (
                            <p className="text-sm text-destructive">{errors.state}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="pincode">Pincode *</Label>
                          <Input
                            id="pincode"
                            value={formData.pincode}
                            onChange={(e) =>
                              setFormData({ ...formData, pincode: e.target.value })
                            }
                            className={errors.pincode ? "border-destructive" : ""}
                          />
                          {errors.pincode && (
                            <p className="text-sm text-destructive">{errors.pincode}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country">Country *</Label>
                          <Input
                            id="country"
                            value={formData.country}
                            onChange={(e) =>
                              setFormData({ ...formData, country: e.target.value })
                            }
                            className={errors.country ? "border-destructive" : ""}
                          />
                          {errors.country && (
                            <p className="text-sm text-destructive">{errors.country}</p>
                          )}
                        </div>
                      </div>

                      {/* Is Default */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="is_default"
                          checked={formData.is_default}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, is_default: checked as boolean })
                          }
                        />
                        <Label htmlFor="is_default" className="cursor-pointer">
                          Set as default address
                        </Label>
                      </div>
                    </div>
                  </ScrollArea>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false);
                        resetForm();
                      }}
                      disabled={submitting}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting} className="flex-1">
                      {submitting ? "Saving..." : editingAddress ? "Update" : "Add Address"}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
