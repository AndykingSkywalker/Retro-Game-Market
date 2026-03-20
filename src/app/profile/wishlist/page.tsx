"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useStore } from "@/components/StoreProvider";

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

export default function WishlistPage() {
  const {
    user,
    wishlist,
    refreshWishlist,
    clearWishlist,
    toggleWishlistItem,
  } = useStore();

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  if (!user) {
    return (
      <section className="ui-card p-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Wishlist</h1>
        <p className="mt-2 text-zinc-700">Please log in to view your wishlist.</p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Wishlist</h1>
          <p className="mt-1 text-zinc-700">Saved games you want to come back to.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/products" className="ui-button-secondary">
            Browse Products
          </Link>
          <button
            type="button"
            onClick={clearWishlist}
            disabled={!wishlist || wishlist.items.length === 0}
            className="ui-button-secondary disabled:cursor-not-allowed disabled:opacity-60"
          >
            Clear Wishlist
          </button>
        </div>
      </div>

      {wishlist && wishlist.items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.items.map((item) => (
            <article key={item.itemId} className="ui-card p-4">
              <div className="mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.itemName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                    No image available
                  </div>
                )}
              </div>

              <h2 className="text-base font-semibold text-zinc-900">{item.itemName}</h2>
              <p className="mt-1 text-sm text-zinc-700">
                {item.console} - {item.genre}
              </p>
              <p className="mt-2 text-base font-bold text-zinc-900">{formatPrice(item.price)}</p>

              <button
                type="button"
                onClick={() => toggleWishlistItem(item.itemId)}
                className="ui-button-secondary mt-3"
              >
                Remove
              </button>
            </article>
          ))}
        </div>
      ) : (
        <p className="ui-card p-6 text-zinc-700">
          Your wishlist is empty. Tap the heart icon on a product card to save a game.
        </p>
      )}
    </section>
  );
}

