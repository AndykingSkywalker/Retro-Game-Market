"use client";

import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number) => void;
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(value);
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <article className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="mb-3 aspect-[4/3] overflow-hidden rounded-lg bg-zinc-100">
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

      <h3 className="text-lg font-semibold text-zinc-900">{product.itemName}</h3>
      <p className="mt-1 text-zinc-700">
        {product.console} - {product.genre}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <span className="text-lg font-bold text-zinc-900">{formatPrice(product.price)}</span>
        {product.onSale ? (
          <span className="rounded-full bg-green-100 px-2 py-1 text-sm font-semibold text-green-800">
            On Sale
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-zinc-700">
        {product.inStock ? `${product.stockLevel} in stock` : "Out of stock"}
      </p>

      {product.inStock ? (
        <button
          type="button"
          onClick={() => onAddToCart(product.id)}
          className="ui-button mt-4"
        >
          Add to Basket
        </button>
      ) : null}
    </article>
  );
}

