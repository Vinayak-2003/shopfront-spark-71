import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const authSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
  contact: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional(),
});

// Password reset schema
const resetSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
});

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { user, login, signup } = useAuth();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      authSchema.parse({ email, password, contact });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    if (!contact) {
      toast.error("Phone number is required for signup");
      return;
    }

    setLoading(true);
    try {
      await signup(email, password, contact);
      // After successful signup, auto-login
      setTimeout(async () => {
        try {
          await login(email, password);
          navigate("/");
        } catch (error) {
          // User needs to login manually
          toast.info("Please sign in with your credentials");
        }
      }, 1000);
    } catch (error) {
      // Error already handled in signup function
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      authSchema.parse({ email, password });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (error) {
      // Error already handled in login function
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      resetSchema.parse({ email: resetEmail });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
        return;
      }
    }

    // Simulate password reset request
    setLoading(true);
    try {
      // In a real app, this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Password reset instructions sent to your email");
      setIsResetDialogOpen(false);
      setResetEmail("");
    } catch (error) {
      toast.error("Failed to send password reset instructions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome to ShopHub</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signin-password">Password</Label>
                    <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                      <DialogTrigger asChild>
                        <button 
                          type="button"
                          className="text-sm text-accent hover:underline"
                          onClick={() => setIsResetDialogOpen(true)}
                        >
                          Forgot password?
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Password Reset</DialogTitle>
                          <DialogDescription>
                            Enter your email address and we'll send you instructions to reset your password.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handlePasswordReset} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="reset-email">Email</Label>
                            <Input
                              id="reset-email"
                              type="email"
                              placeholder="you@example.com"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsResetDialogOpen(false)}
                              disabled={loading}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={loading} className="flex-1">
                              {loading ? "Sending..." : "Send Reset Link"}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="accent"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-contact">Phone Number</Label>
                  <Input
                    id="signup-contact"
                    type="tel"
                    placeholder="+1234567890"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  variant="accent"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}