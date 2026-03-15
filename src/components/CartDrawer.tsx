"use client";

import Link from "next/link";
import CartItem from "@/components/CartItem";
import { useStore } from "@/components/StoreProvider";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, clearCart, user } = useStore();

  if (!isCartOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        aria-label="Open basket drawer"
        aria-expanded={false}
        aria-controls="basket-drawer"
        className="fixed right-0 top-1/3 z-30 rounded-l-lg border border-zinc-400 bg-white px-3 py-4 text-sm font-semibold text-zinc-900 shadow"
      >
        Basket
      </button>
    );
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
          aria-label="Close basket drawer"
          className="ui-button-secondary px-2 py-1"
        >
          Close
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

