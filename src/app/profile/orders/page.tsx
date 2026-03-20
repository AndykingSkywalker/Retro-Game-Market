"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/components/StoreProvider";
import { getErrorMessage, getOrderHistory } from "@/lib/api";
import type { Order } from "@/types/order";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function OrderHistoryPage() {
  const { user } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    const currentUserId = user.id;

    async function loadOrderHistory() {
      try {
        const history = await getOrderHistory(currentUserId);
        setOrders(history);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    loadOrderHistory();
  }, [user]);

  if (!user) {
    return (
      <section className="ui-card p-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Order History</h1>
        <p className="mt-2 text-zinc-700">Please log in to view your previous orders.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Order History</h1>
          <p className="mt-1 text-zinc-700">Select an order to view full line-item details.</p>
        </div>
        <Link href="/profile" className="ui-button-secondary">
          Back to Profile
        </Link>
      </div>

      {isLoading ? <p>Loading order history...</p> : null}
      {errorMessage ? <p className="text-red-700">{errorMessage}</p> : null}

      {!isLoading && !errorMessage ? (
        orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <article key={order.id} className="ui-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-zinc-900">#{order.orderNumber}</h2>
                    <p className="text-sm text-zinc-600">Placed {formatDate(order.createdAt)}</p>
                    <p className="text-xs text-zinc-600">{order.lineItemCount} line(s) - {order.totalQuantity} item(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-600">Total</p>
                    <p className="text-lg font-bold text-zinc-900">{formatPrice(order.totalAmount)}</p>
                    <Link href={`/profile/orders/${order.id}`} className="ui-button-secondary mt-2 inline-flex">
                      View Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="ui-card p-6 text-zinc-700">You have not placed any orders yet.</p>
        )
      ) : null}
    </section>
  );
}



