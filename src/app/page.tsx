"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/components/StoreProvider";
import { getErrorMessage, getItems } from "@/lib/api";
import type { Product } from "@/types/product";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const {
    cart,
    wishlist,
    toggleWishlistItem,
    updateCartItemQuantity,
    user,
    isLoading: isSessionLoading,
  } = useStore();

  useEffect(() => {
    if (!user) {
      setProducts([]);
      setIsLoading(false);
      return;
    }

    async function loadProducts() {
      try {
        const items = await getItems();
        setProducts(items);
      } catch (error) {
        setLocalError(getErrorMessage(error));
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, [user]);

  const featuredOnSale = useMemo(
    () => products.filter((product) => product.onSale).slice(0, 6),
    [products],
  );

  const quantitiesByItemId = useMemo(
    () => new Map((cart?.items ?? []).map((item) => [item.itemId, item.quantity])),
    [cart],
  );

  const wishlistedItemIds = useMemo(
    () => new Set((wishlist?.items ?? []).map((item) => item.itemId)),
    [wishlist],
  );

  if (isSessionLoading) {
    return <p>Loading store...</p>;
  }

  if (!user) {
    return (
      <section className="mx-auto grid max-w-5xl gap-6 py-10 lg:grid-cols-2">
        <div className="ui-card p-8">
          <h1 className="text-4xl font-bold text-zinc-900">Retro Game Market</h1>
          <p className="mt-4 text-zinc-700">
            Discover classic titles across iconic consoles, from handheld favorites to
            living-room legends. Build your basket, track sale drops, and manage your profile
            in one place.
          </p>
          <div className="mt-6 space-y-3 text-zinc-700">
            <p>- Curated retro catalogue across multiple consoles and genres</p>
            <p>- Weekly featured deals and on-sale highlights</p>
            <p>- Secure account experience with JWT authentication</p>
          </div>
        </div>

        <div className="ui-card p-8">
          <h2 className="text-2xl font-semibold text-zinc-900">Get Started</h2>
          <p className="mt-2 text-zinc-700">
            Sign in to browse products, manage your basket, and checkout.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/login" className="ui-button inline-flex items-center justify-center">
              Sign In
            </Link>
            <Link href="/register" className="ui-button-secondary inline-flex items-center justify-center">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Featured Deals</h1>
        <p className="mt-1 text-zinc-600">
          Browse this week&apos;s sale picks from our retro catalogue.
        </p>
      </div>

      {isLoading ? <p>Loading featured items...</p> : null}
      {localError ? <p className="text-red-600">{localError}</p> : null}

      {!isLoading && !localError ? (
        featuredOnSale.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredOnSale.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantityInCart={quantitiesByItemId.get(product.id) ?? 0}
                isWishlisted={wishlistedItemIds.has(product.id)}
                onChangeQuantity={updateCartItemQuantity}
                onToggleWishlist={toggleWishlistItem}
              />
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-zinc-200 bg-white p-4 text-zinc-700">
            There are currently no sale items.
          </p>
        )
      ) : null}
    </section>
  );
}
