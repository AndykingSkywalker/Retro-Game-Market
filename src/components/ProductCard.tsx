"use client";

import { useEffect, useRef, useState } from "react";
import { HeartIcon as HeartOutlineIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import type { Product } from "@/types/product";
import { useStore } from "@/components/StoreProvider";

interface ProductCardProps {
  product: Product;
  quantityInCart: number;
  isWishlisted: boolean;
  onChangeQuantity: (productId: number, quantity: number) => Promise<void>;
  onToggleWishlist: (productId: number) => Promise<boolean>;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

export default function ProductCard({
  product,
  quantityInCart,
  isWishlisted,
  onChangeQuantity,
  onToggleWishlist,
}: ProductCardProps) {
  const { showToast } = useStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isWishlistUpdating, setIsWishlistUpdating] = useState(false);
  const [isHeartAnimating, setIsHeartAnimating] = useState(false);
  const previousQuantityRef = useRef(quantityInCart);
  const discount = product.onSale ? product.saleDiscountPercent ?? 0 : 0;
  const hasDiscount = discount > 0;
  const isAtStockLimit = quantityInCart >= product.stockLevel;
  const discountedPrice = hasDiscount
    ? Math.max(0, product.price * (1 - discount / 100))
    : product.price;

  async function handleQuantityChange(nextQuantity: number): Promise<void> {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await onChangeQuantity(product.id, nextQuantity);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleWishlistToggle(): Promise<void> {
    if (isWishlistUpdating) return;

    setIsWishlistUpdating(true);
    try {
      const isNowWishlisted = await onToggleWishlist(product.id);
      if (isNowWishlisted) {
        setIsHeartAnimating(true);
        showToast("Added to wishlist.", "success");
      } else {
        showToast("Removed from wishlist.", "info");
      }
    } finally {
      setIsWishlistUpdating(false);
    }
  }

  useEffect(() => {
    if (!isHeartAnimating) return;

    const timeoutId = window.setTimeout(() => {
      setIsHeartAnimating(false);
    }, 650);

    return () => window.clearTimeout(timeoutId);
  }, [isHeartAnimating]);

  useEffect(() => {
    const previousQuantity = previousQuantityRef.current;
    const hasReachedLimit =
      quantityInCart > previousQuantity && quantityInCart >= product.stockLevel;

    if (hasReachedLimit) {
      showToast("Stock limit reached for this item.", "warning");
    }

    previousQuantityRef.current = quantityInCart;
  }, [product.stockLevel, quantityInCart, showToast]);

  return (
    <article className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100">
        <button
          type="button"
          onClick={handleWishlistToggle}
          disabled={isWishlistUpdating}
          aria-pressed={isWishlisted}
          aria-label={isWishlisted ? `Remove ${product.itemName} from wishlist` : `Add ${product.itemName} to wishlist`}
          className={`absolute right-2 top-2 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white/95 shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
            isWishlisted ? "border-red-300 text-red-500" : "border-zinc-300 text-zinc-500 hover:text-red-400"
          }`}
        >
          {isHeartAnimating ? <span className="heart-burst-ring" /> : null}
          {isHeartAnimating ? <span className="heart-burst-particles" /> : null}
          <span className={isHeartAnimating ? "heart-burst-icon" : ""}>
            {isWishlisted ? <HeartSolidIcon className="h-5 w-5" aria-hidden="true" /> : <HeartOutlineIcon className="h-5 w-5" aria-hidden="true" />}
          </span>
        </button>

        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={product.itemName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-zinc-500">
            No image available
          </div>
        )}
      </div>

      <h3 className="text-base font-semibold text-zinc-900">{product.itemName}</h3>
      <p className="mt-1 text-sm text-zinc-700">
        {product.console} - {product.genre}
      </p>

      <div className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        {hasDiscount ? (
          <>
            <span className="whitespace-nowrap text-xs font-semibold text-zinc-600 line-through">
              WAS {formatPrice(product.price)}
            </span>
            <span className="whitespace-nowrap text-base font-bold text-zinc-900">
              NOW {formatPrice(discountedPrice)}
            </span>
          </>
        ) : (
          <span className="text-base font-bold text-zinc-900">{formatPrice(product.price)}</span>
        )}
        {product.onSale ? (
          <span className="whitespace-nowrap rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
            On Sale{hasDiscount ? ` ${discount}%` : ""}
          </span>
        ) : null}
      </div>

      {!product.inStock ? (
        <p className="mt-2 text-center font-bold text-red-700">Out of stock</p>
      ) : null}

      {product.inStock ? (
        quantityInCart > 0 ? (
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuantityChange(quantityInCart - 1)}
              disabled={isUpdating}
              className="ui-button-secondary h-9 w-9 px-0 text-base disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Decrease ${product.itemName} quantity`}
            >
              -
            </button>
            <span className="min-w-7 text-center text-base font-semibold text-zinc-900">
              {quantityInCart}
            </span>
            <button
              type="button"
              onClick={() => handleQuantityChange(quantityInCart + 1)}
              disabled={isUpdating || isAtStockLimit}
              className="ui-button h-9 w-9 px-0 text-base disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Increase ${product.itemName} quantity`}
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => handleQuantityChange(1)}
            disabled={isUpdating}
            className="ui-button mt-4 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add to Basket
          </button>
        )
      ) : null}
    </article>
  );
}

