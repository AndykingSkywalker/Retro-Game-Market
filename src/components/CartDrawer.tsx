"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import CartItem from "@/components/CartItem";
import { useStore } from "@/components/StoreProvider";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

export default function CartDrawer() {
  const pathname = usePathname();
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, clearCart, user } = useStore();

  useEffect(() => {
    setIsCartOpen(false);
  }, [pathname, setIsCartOpen]);

  if (!isCartOpen) {
    return null;
  }

  return (
    <aside
      id="basket-drawer"
      className="fixed right-0 top-0 z-30 flex h-full w-full max-w-sm flex-col border-l border-zinc-200 bg-zinc-50 shadow-xl"
      aria-label="Basket drawer"
    >
      <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
        <h2 className="text-lg font-semibold">Your Basket</h2>
        <button
          type="button"
          onClick={() => setIsCartOpen(false)}
          aria-label="Close basket"
          className="ui-button-secondary inline-flex h-9 w-9 items-center justify-center px-0"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {!user ? (
          <p className="rounded-md bg-white p-3 text-zinc-800">
            Log in to manage your cart.
          </p>
        ) : cart && cart.items.length > 0 ? (
          cart.items.map((item) => (
            <CartItem key={item.itemId} item={item} onRemove={removeFromCart} />
          ))
        ) : (
          <p className="rounded-md bg-white p-3 text-zinc-800">Your basket is empty.</p>
        )}
      </div>

      <div className="border-t border-zinc-200 bg-white p-4">
        <p className="mb-3 text-zinc-800">
          Total: <span className="font-semibold text-zinc-900">{formatPrice(cart?.total ?? 0)}</span>
        </p>
        <div className="flex gap-2">
          <Link
            href="/cart"
            onClick={() => setIsCartOpen(false)}
            className="ui-button flex-1 text-center"
          >
            Checkout
          </Link>
          <button
            type="button"
            onClick={clearCart}
            disabled={!cart || cart.items.length === 0}
            className="ui-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      </div>
    </aside>
  );
}

