import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/lib/auth";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

export default function Index() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isAuthenticated, setAuthToken } = useAuth();
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email.trim(), password);
      // Sau khi login() đã set accessToken trong memory, đồng bộ Context bằng access token
      const { getAccessToken } = await import("@/lib/auth");
      const token = getAccessToken();
      if (token) setAuthToken(token);
      toast.success("Signed in");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message || "Login failed");
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="logo"
            className="w-10 h-10 rounded-md bg-primary/15 grid place-items-center"
          />
          <span className="text-lg font-semibold">Timekeeping Management</span>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Timekeeping Management App
          </h1>
          <p className="mt-3 text-muted-foreground max-w-md">
            Sign in to access your dashboard and manage timekeeping
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Hiptech Solution Inc.
        </p>
      </div>
      <div className="flex items-center justify-center p-8 md:p-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full mt-1"
                disabled={loading || !email || !password}
              >
                Sign in
              </Button>
              {error && (
                <p className="text-xs text-red-500 text-center">{error}</p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
