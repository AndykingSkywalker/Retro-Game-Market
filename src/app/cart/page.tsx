"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CartItem from "@/components/CartItem";
import { useStore } from "@/components/StoreProvider";
import { checkout, getErrorMessage } from "@/lib/api";
import type { Order } from "@/types/order";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

export default function CartPage() {
  const router = useRouter();
  const { user, cart, refreshCart, removeFromCart, clearCart, showToast } = useStore();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    if (!completedOrder) return;

    const timeoutId = window.setTimeout(() => {
      router.push("/profile/orders");
    }, 1400);

    return () => window.clearTimeout(timeoutId);
  }, [completedOrder, router]);

  async function handleCheckout() {
    if (!user || !cart || cart.items.length === 0 || isPlacingOrder) return;

    setIsPlacingOrder(true);
    setCheckoutError(null);

    try {
      const order = await checkout(user.id);
      setCompletedOrder(order);
      showToast("Order placed successfully.", "success");
      await refreshCart();
    } catch (error) {
      setCheckoutError(getErrorMessage(error));
    } finally {
      setIsPlacingOrder(false);
    }
  }

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
      <div className="flex flex-wrap items-center justify-between gap-3">
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
            {checkoutError ? (
              <p className="mt-2 text-sm text-red-700">{checkoutError}</p>
            ) : null}
            <button
              type="button"
              onClick={handleCheckout}
              disabled={isPlacingOrder}
              className="ui-button mt-3"
            >
              {isPlacingOrder ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </>
      ) : (
        <p className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-700">
          Your basket is empty.
        </p>
      )}

      {completedOrder ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 text-center shadow-xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-green-700">Order Complete</p>
            <h2 className="mt-2 text-2xl font-bold text-zinc-900">ORDER COMPLETE</h2>
            <p className="mt-2 text-zinc-700">
              {completedOrder.orderNumber ? `Order #${completedOrder.orderNumber}` : "Your order"} has been placed successfully.
            </p>
            <p className="mt-1 text-sm text-zinc-600">Redirecting to order history...</p>
            <button
              type="button"
              onClick={() => router.push("/profile/orders")}
              className="ui-button mt-4"
            >
              View Order History
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

