// Address type definitions matching backend API schema

export type AddressType = "home" | "office" | "other";

// Address output schema from backend
export interface Address {
  address_id: string;  // UUID
  user_id: string;  // UUID
  address_type: AddressType;
  receiver_name: string;
  receiver_email: string;
  receiver_contact: string;  // Pattern: ^\+?[1-9]\d{1,14}$
  address_line_1: string;
  address_line_2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
  created_at: string;  // ISO datetime
  updated_at: string;  // ISO datetime
}

// Address creation schema
export interface AddressCreate {
  address_type: AddressType;
  receiver_name: string;
  receiver_email: string;
  receiver_contact: string;
  address_line_1: string;
  address_line_2?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
}

// Address update schema (all fields optional)
export interface AddressUpdate {
  address_type?: AddressType | null;
  receiver_name?: string | null;
  receiver_email?: string | null;
  receiver_contact?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  landmark?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
  is_default?: boolean | null;
}
