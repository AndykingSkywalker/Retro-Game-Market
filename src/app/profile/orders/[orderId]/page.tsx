"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
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

export default function OrderDetailPage() {
  const { user } = useStore();
  const params = useParams<{ orderId: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const orderId = Number(params.orderId);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const currentUserId = user.id;

    async function loadOrders() {
      try {
        const history = await getOrderHistory(currentUserId);
        setOrders(history);
      } catch (error) {
        setErrorMessage(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, [user]);

  const order = useMemo(
    () => orders.find((candidate) => candidate.id === orderId),
    [orders, orderId],
  );

  if (!user) {
    return (
      <section className="ui-card p-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Order Details</h1>
        <p className="mt-2 text-zinc-700">Please log in to view this order.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Order Details</h1>
          <p className="mt-1 text-zinc-700">Full breakdown for this order.</p>
        </div>
        <Link href="/profile/orders" className="ui-button-secondary">
          Back to Orders
        </Link>
      </div>

      {isLoading ? <p>Loading order...</p> : null}
      {errorMessage ? <p className="text-red-700">{errorMessage}</p> : null}

      {!isLoading && !errorMessage ? (
        order ? (
          <article className="ui-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-200 pb-3">
              <div>
                <h2 className="text-xl font-semibold text-zinc-900">#{order.orderNumber}</h2>
                <p className="text-sm text-zinc-600">Placed {formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-zinc-600">Total</p>
                <p className="text-xl font-bold text-zinc-900">{formatPrice(order.totalAmount)}</p>
                <p className="text-xs text-zinc-600">{order.totalQuantity} item(s)</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {order.items.map((item) => (
                <div
                  key={`${order.id}-${item.itemId}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-zinc-900">{item.itemName}</p>
                    <p className="text-sm text-zinc-600">
                      {item.console} - {item.genre} - Qty {item.quantity}
                    </p>
                    {item.onSale ? (
                      <p className="text-xs text-green-700">
                        Sale {item.saleDiscountPercent ?? 0}% - Unit {formatPrice(item.discountedUnitPrice ?? item.unitPrice)}
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-600">Unit {formatPrice(item.unitPrice)}</p>
                    )}
                  </div>
                  <p className="font-semibold text-zinc-900">{formatPrice(item.lineTotal)}</p>
                </div>
              ))}
            </div>
          </article>
        ) : (
          <p className="ui-card p-6 text-zinc-700">Order not found.</p>
        )
      ) : null}
    </section>
  );
}

