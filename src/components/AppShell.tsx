"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import CartDrawer from "@/components/CartDrawer";
import DevTerminal from "@/components/DevTerminal";
import NavBar from "@/components/NavBar";
import { useStore } from "@/components/StoreProvider";
import ThemeToggle from "@/components/ThemeToggle";

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { errorMessage, clearError, toasts, dismissToast, user, isLoading } = useStore();
  const isGuestEntryRoute = ["/", "/login", "/register"].includes(pathname);
  const hideNavigationForGuestEntry = isGuestEntryRoute && !user && !isLoading;

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = ["/", "/login", "/register"].includes(pathname);
    if (!user && !isPublicRoute) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [isLoading, pathname, router, user]);

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
      <main id="main-content" className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
      {toasts.length > 0 ? (
        <div className="fixed bottom-4 left-1/2 z-40 flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4">
          {toasts.map((toast) => {
            const toneClass =
              toast.tone === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : toast.tone === "warning"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-zinc-200 bg-white text-zinc-800";

            return (
              <div
                key={toast.id}
                className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm shadow ${toneClass}`}
                role="status"
                aria-live="polite"
              >
                <span>{toast.message}</span>
                <button
                  type="button"
                  className="ml-3 text-xs font-semibold hover:underline"
                  onClick={() => dismissToast(toast.id)}
                >
                  Dismiss
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
      {hideNavigationForGuestEntry ? null : <CartDrawer />}
      <ThemeToggle />
      <DevTerminal />
    </div>
  );
}

