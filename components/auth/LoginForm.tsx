"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VaultLogo } from "@/components/logo/VaultLogo";
import { Particles } from "@/components/ui/particles";
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
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 bg-[#0a0a0f]">
      <Particles
        className="absolute inset-0"
        quantity={100}
        ease={50}
        color="#ffffff"
        size={0.4}
      />
      <Card className="relative z-10 w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto">
            <VaultLogo size={64} />
          </div>
          <CardTitle className="text-3xl font-bold">Vault</CardTitle>
          <CardDescription>
            Enter your master password to access your vault
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                className="w-full"
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
        </CardContent>
      </Card>
    </div>
  );
}

