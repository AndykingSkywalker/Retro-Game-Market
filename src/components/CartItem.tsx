"use client";

import type { CartItemSummary } from "@/types/cart";

interface CartItemProps {
  item: CartItemSummary;
  onRemove: (itemId: number) => void;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

export default function CartItem({ item, onRemove }: CartItemProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-zinc-900">{item.itemName}</p>
          <p className="text-sm text-zinc-600">
            {item.console} - {item.genre}
          </p>
          <p className="text-sm text-zinc-600">Qty: {item.quantity}</p>
        </div>

        <div className="text-right">
          <p className="font-semibold text-zinc-900">{formatPrice(item.price * item.quantity)}</p>
          <button
            type="button"
            onClick={() => onRemove(item.itemId)}
            className="mt-1 text-sm text-red-600 hover:underline"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

