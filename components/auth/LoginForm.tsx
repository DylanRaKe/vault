"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VaultLogo } from "@/components/logo/VaultLogo";
import { Ripple } from "@/components/ui/ripple";
import { getStoredPassword, setStoredPassword } from "@/lib/storage";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedPassword = getStoredPassword();
    if (storedPassword) {
      setPassword(storedPassword);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid password");
        return;
      }

      // Store password in localStorage for simplicity
      setStoredPassword(password);
      
      // Redirect to vault
      router.push("/vault");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-[#0a0a0f]">
      <Ripple className="absolute inset-0" />
      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-card/40 border border-border/50 rounded-lg shadow-2xl p-8 space-y-6">
          <div className="space-y-4 text-center">
            <div className="mx-auto">
              <VaultLogo size={64} />
            </div>
            <h1 className="text-3xl font-bold">Vault</h1>
            <p className="text-sm text-muted-foreground">
              Enter your master password to access your vault
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Master Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoFocus
                className="w-full bg-background/50 backdrop-blur-sm border-border/50"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Unlock Vault"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

