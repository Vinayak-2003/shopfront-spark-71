// User type definitions matching backend API schema

export type UserRole = "admin" | "seller" | "customer";

// User output schema from backend
export interface User {
  user_id: string;  // UUID
  user_email: string;
  user_contact: string;
  role: UserRole;
  user_created_time: string;  // ISO datetime
  user_updated_time: string;  // ISO datetime
  user_last_login_time: string | null;  // ISO datetime or null
}

// User creation (signup) schema
export interface UserCreate {
  user_email: string;
  user_contact: string;  // Must match pattern: ^\+?[1-9]\d{1,14}$
  password: string;
}

// User update schema
export interface UserUpdate {
  user_contact?: string | null;
  password?: string | null;
}

// User role update (admin only)
export interface UserRoleUpdate {
  role?: UserRole | null;
}

// Login request schema
export interface LoginRequest {
  username: string;  // Backend uses 'username' field for email
  password: string;
  grant_type?: string;
  scope?: string;
  client_id?: string | null;
  client_secret?: string | null;
}

// Token response from login
export interface TokenSchema {
  access_token: string;
  token_type?: string;  // Default: "Bearer"
}

// Auth response with user data
export interface AuthResponse {
  token: TokenSchema;
  user: User;
}
