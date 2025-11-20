export function getStoredPassword(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("vault_password");
}

export function setStoredPassword(password: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("vault_password", password);
}

export function clearStoredPassword(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("vault_password");
}

