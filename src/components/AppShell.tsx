"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import CartDrawer from "@/components/CartDrawer";
import DevTerminal from "@/components/DevTerminal";
import NavBar from "@/components/NavBar";
import { useStore } from "@/components/StoreProvider";
import ThemeToggle from "@/components/ThemeToggle";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { errorMessage, clearError, user, isLoading } = useStore();
  const isGuestEntryRoute = ["/", "/login", "/register"].includes(pathname);
  const hideNavigationForGuestEntry = isGuestEntryRoute && !user && !isLoading;

  return (
    <div className="min-h-screen bg-zinc-100">
      {hideNavigationForGuestEntry ? null : <NavBar />}
      {errorMessage ? (
        <div className="mx-auto mt-3 w-full max-w-6xl px-4">
          <div
            className="flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
            aria-live="assertive"
          >
            <span>{errorMessage}</span>
            <button type="button" className="font-medium hover:underline" onClick={clearError}>
              Dismiss
            </button>
          </div>
        </div>
      ) : null}
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
      {hideNavigationForGuestEntry ? null : <CartDrawer />}
      <ThemeToggle />
      <DevTerminal />
    </div>
  );
}

