// Password verification is done server-side in API route
// These functions are kept for potential future use

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem("vault_session");
  return !!token;
}

export function setSession(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("vault_session", token);
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("vault_session");
}

export function getSession(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vault_session");
}

