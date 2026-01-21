import React, { createContext, useContext, useState, useEffect } from "react";
import { User, TokenSchema } from "@/types/user";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, contact: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (token) {
          setAccessToken(token);
          // Fetch current user from backend
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
        // Clear invalid token
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const tokens = await authApi.login(email, password);
      
      // Store tokens
      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      setAccessToken(tokens.access_token);

      // Fetch user data
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      
      toast.success("Logged in successfully");
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please check your credentials and try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const signup = async (email: string, password: string, contact: string) => {
    try {
      await authApi.signup({
        user_email: email,
        password,
        user_contact: contact,
      });
      
      toast.success("Account created successfully! Please log in.");
    } catch (error) {
      console.error("Signup error:", error);
      const errorMessage = error instanceof Error ? error.message : "Signup failed. Please try again with different credentials.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setAccessToken(null);
    setUser(null);
    toast.success("Logged out successfully");
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      const errorMessage = error instanceof Error ? error.message : "Session expired. Please log in again.";
      toast.error(errorMessage);
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
