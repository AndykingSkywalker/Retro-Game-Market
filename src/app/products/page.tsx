"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/components/StoreProvider";
import { getErrorMessage, getItems } from "@/lib/api";
import type { Product, ProductFilters } from "@/types/product";

const defaultFilters: ProductFilters = {
  genre: "all",
  console: "all",
  onSaleOnly: false,
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>(defaultFilters);
  const [localError, setLocalError] = useState<string | null>(null);
  const { addToCart } = useStore();

  useEffect(() => {
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
  }, []);

  const genres = useMemo(
    () => ["all", ...new Set(products.map((product) => product.genre).filter(Boolean))],
    [products],
  );

  const consoles = useMemo(
    () => ["all", ...new Set(products.map((product) => product.console).filter(Boolean))],
    [products],
  );

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const genreMatch = filters.genre === "all" || product.genre === filters.genre;
      const consoleMatch = filters.console === "all" || product.console === filters.console;
      const saleMatch = !filters.onSaleOnly || product.onSale;
      return genreMatch && consoleMatch && saleMatch;
    });
  }, [products, filters]);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">All Products</h1>
        <p className="mt-1 text-zinc-700">Filter by genre, console, and sale status.</p>
      </div>

      <div className="ui-card grid gap-3 p-4 sm:grid-cols-3">
        <label className="ui-label">
          Genre
          <select
            value={filters.genre}
            onChange={(event) => setFilters((prev) => ({ ...prev, genre: event.target.value }))}
            className="ui-select"
          >
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </label>

        <label className="ui-label">
          Console
          <select
            value={filters.console}
            onChange={(event) => setFilters((prev) => ({ ...prev, console: event.target.value }))}
            className="ui-select"
          >
            {consoles.map((consoleName) => (
              <option key={consoleName} value={consoleName}>
                {consoleName}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 pt-7 font-semibold text-zinc-900">
          <input
            type="checkbox"
            checked={filters.onSaleOnly}
            onChange={(event) =>
              setFilters((prev) => ({ ...prev, onSaleOnly: event.target.checked }))
            }
          />
          On sale only
        </label>
      </div>

      {isLoading ? <p>Loading products...</p> : null}
      {localError ? <p className="text-red-600">{localError}</p> : null}

      {!isLoading && !localError ? (
        filteredProducts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-zinc-200 bg-white p-4 text-zinc-700">
            No products match this filter.
          </p>
        )
      ) : null}
    </section>
  );
}

