import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Lock, Mail, UserPlus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkingGate, setCheckingGate] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const checkGateStatus = async () => {
      try {
        const response = await fetch("/api/auth/gate-status");
        const data = await response.json();
        if (!data.gatePassed) {
          navigate("/gate");
        }
      } catch (error) {
        navigate("/gate");
      } finally {
        setCheckingGate(false);
      }
    };
    checkGateStatus();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message);
        toast({
          title: "Registration Successful",
          description: data.message,
        });
      } else {
        toast({
          title: "Registration Failed",
          description: data.message || "Failed to register",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to register",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingGate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Registration Complete</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-green-900/50 border-green-700">
              <AlertDescription className="text-green-200">
                {successMessage}
              </AlertDescription>
            </Alert>
            <Button 
              onClick={() => navigate("/login")}
              className="w-full bg-blue-600 hover:bg-blue-700"
              data-testid="button-go-to-login"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl text-white">Create Account</CardTitle>
            <CardDescription className="text-slate-400 mt-2">
              Register for access to the Control Tower
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-300">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                    data-testid="input-first-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-300">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  data-testid="input-last-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  required
                  data-testid="input-email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  required
                  data-testid="input-password"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-300">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500"
                  required
                  data-testid="input-confirm-password"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              disabled={isLoading || !email || !password || !confirmPassword}
              data-testid="button-register"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 text-center">
          <div className="text-sm text-slate-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-400 hover:text-blue-300" data-testid="link-login">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
