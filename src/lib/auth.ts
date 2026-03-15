import type { UserRole } from "@/types/user";

const TOKEN_KEY = "rgm_token";
const ROLE_KEY = "rgm_role";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveSession(token: string, role: UserRole): void {
  if (!isBrowser()) return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
}

export function clearSession(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
}

export function getToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRole(): UserRole | null {
  if (!isBrowser()) return null;
  const role = localStorage.getItem(ROLE_KEY);
  if (role === "CUSTOMER" || role === "ADMIN") {
    return role;
  }
  return null;
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}

