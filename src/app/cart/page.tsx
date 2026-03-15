"use client";

import { useEffect } from "react";
import CartItem from "@/components/CartItem";
import { useStore } from "@/components/StoreProvider";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

export default function CartPage() {
  const { user, cart, refreshCart, removeFromCart, clearCart } = useStore();

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  if (!user) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="mt-2 text-zinc-700">Please log in to view your basket.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-900">Checkout</h1>
        <button
          type="button"
          onClick={clearCart}
          disabled={!cart || cart.items.length === 0}
          className="ui-button-secondary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear Basket
        </button>
      </div>

      {cart && cart.items.length > 0 ? (
        <>
          <div className="space-y-3">
            {cart.items.map((item) => (
              <CartItem key={item.itemId} item={item} onRemove={removeFromCart} />
            ))}
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-right">
            <p className="text-zinc-700">Order total</p>
            <p className="text-2xl font-bold text-zinc-900">{formatPrice(cart.total)}</p>
            <button
              type="button"
              className="ui-button mt-3"
            >
              Place Order (next step)
            </button>
          </div>
        </>
      ) : (
        <p className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-700">
          Your basket is empty.
        </p>
      )}
    </section>
  );
}

