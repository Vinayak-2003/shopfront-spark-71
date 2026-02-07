import React, { createContext, useContext, useState, useEffect } from "react";
import { User, TokenSchema } from "@/types/user";
import { authApi, setAccessToken as setApiAccessToken, refreshAccessToken } from "@/lib/api";
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

  // Init session on mount - try to refresh/get user if cookie exists
  useEffect(() => {
    const initSession = async () => {
      try {
        // Try to get new access token via refresh (cookie)
        // This will verify if we have a valid session
        const token = await refreshAccessToken();
        if (token) {
          // We don't need to call setApiAccessToken here because refreshAccessToken does it internally
          setAccessToken(token);
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.log("No active session or session expired");
        // No action needed, user remains guest
      } finally {
        setLoading(false);
      }
    };

    initSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const tokens = await authApi.login(email, password);

      // Store access token in memory both in Context and API module
      setAccessToken(tokens.access_token);
      setApiAccessToken(tokens.access_token);

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

  const logout = async () => {
    try {
      // Call backend logout to clear cookie
      await authApi.logout();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      // Clear memory even if backend fails
      setApiAccessToken(null);
      setAccessToken(null);
      setUser(null);
      toast.success("Logged out successfully");
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user:", error);
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
