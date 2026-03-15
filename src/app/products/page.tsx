"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { useStore } from "@/components/StoreProvider";
import { getErrorMessage, getItems } from "@/lib/api";
import type { Product } from "@/types/product";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function getInitialLetter(value: string): string {
  const firstChar = value.trim().charAt(0).toUpperCase();
  return /^[A-Z]$/.test(firstChar) ? firstChar : "#";
}

export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedLetter, setSelectedLetter] = useState<string>("all");
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

  const platforms = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      if (!product.console) continue;
      counts.set(product.console, (counts.get(product.console) ?? 0) + 1);
    }

    const entries = Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return [
      {
        name: "all",
        label: "All Platforms",
        count: products.length,
      },
      ...entries.map((entry) => ({ ...entry, label: entry.name })),
    ];
  }, [products]);

  useEffect(() => {
    const platformFromUrl = searchParams.get("platform") ?? "all";
    const letterRaw = searchParams.get("letter") ?? "all";
    const letterFromUrl =
      letterRaw === "all" || letterRaw === "#"
        ? letterRaw
        : /^[A-Za-z]$/.test(letterRaw)
          ? letterRaw.toUpperCase()
          : "all";

    setSelectedPlatform((previous) =>
      previous === platformFromUrl ? previous : platformFromUrl,
    );
    setSelectedLetter((previous) =>
      previous === letterFromUrl ? previous : letterFromUrl,
    );
  }, [searchParams]);

  useEffect(() => {
    if (selectedPlatform !== "all" && !platforms.some((platform) => platform.name === selectedPlatform)) {
      setSelectedPlatform("all");
    }
  }, [platforms, selectedPlatform]);

  const platformFilteredProducts = useMemo(() => {
    if (selectedPlatform === "all") return products;
    return products.filter((product) => product.console === selectedPlatform);
  }, [products, selectedPlatform]);

  const availableLetters = useMemo(() => {
    return new Set(platformFilteredProducts.map((product) => getInitialLetter(product.itemName)));
  }, [platformFilteredProducts]);

  const filteredProducts = useMemo(() => {
    if (selectedLetter === "all") return platformFilteredProducts;
    return platformFilteredProducts.filter(
      (product) => getInitialLetter(product.itemName) === selectedLetter,
    );
  }, [platformFilteredProducts, selectedLetter]);

  useEffect(() => {
    if (selectedLetter !== "all" && !availableLetters.has(selectedLetter)) {
      setSelectedLetter("all");
    }
  }, [availableLetters, selectedLetter]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());

    if (selectedPlatform === "all") {
      nextParams.delete("platform");
    } else {
      nextParams.set("platform", selectedPlatform);
    }

    if (selectedLetter === "all") {
      nextParams.delete("letter");
    } else {
      nextParams.set("letter", selectedLetter);
    }

    const nextQuery = nextParams.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    const currentQuery = searchParams.toString();
    const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [pathname, router, searchParams, selectedLetter, selectedPlatform]);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">All Products</h1>
        <p className="mt-1 text-zinc-700">
          Choose a platform on the left, then filter by the first letter of the game title.
        </p>
      </div>

      {isLoading ? <p>Loading products...</p> : null}
      {localError ? <p className="text-red-600">{localError}</p> : null}

      {!isLoading && !localError ? (
        <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
          <aside className="ui-card p-4">
            <h2 className="text-lg font-semibold text-zinc-900">Platforms</h2>
            <div className="mt-3 space-y-2">
              {platforms.map((platform) => {
                const isActive = selectedPlatform === platform.name;
                return (
                  <button
                    key={platform.name}
                    type="button"
                    onClick={() => {
                      setSelectedPlatform(platform.name);
                      setSelectedLetter("all");
                    }}
                    className={`${isActive ? "ui-button" : "ui-button-secondary"} flex w-full items-center justify-between`}
                    aria-pressed={isActive}
                  >
                    <span>{platform.label}</span>
                    <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">
                      {platform.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="space-y-4">
            <div className="ui-card p-4">
              <h2 className="text-lg font-semibold text-zinc-900">A-Z Filter</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLetter("all")}
                  className={selectedLetter === "all" ? "ui-button" : "ui-button-secondary"}
                  aria-pressed={selectedLetter === "all"}
                >
                  All
                </button>
                {LETTERS.map((letter) => {
                  const isAvailable = availableLetters.has(letter);
                  const isActive = selectedLetter === letter;
                  const className = isAvailable
                    ? isActive
                      ? "ui-button"
                      : "ui-button-secondary"
                    : "ui-button-secondary opacity-40 cursor-not-allowed";
                  return (
                    <button
                      key={letter}
                      type="button"
                      onClick={() => setSelectedLetter(letter)}
                      disabled={!isAvailable}
                      className={className}
                      aria-pressed={isActive}
                    >
                      {letter}
                    </button>
                  );
                })}
                {(() => {
                  const isHashAvailable = availableLetters.has("#");
                  const hashClassName = isHashAvailable
                    ? selectedLetter === "#"
                      ? "ui-button"
                      : "ui-button-secondary"
                    : "ui-button-secondary opacity-40 cursor-not-allowed";

                  return (
                <button
                  type="button"
                  onClick={() => setSelectedLetter("#")}
                  disabled={!isHashAvailable}
                  className={hashClassName}
                  aria-pressed={selectedLetter === "#"}
                >
                  #
                </button>
                  );
                })()}
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
              </div>
            ) : (
              <p className="ui-card p-4 text-zinc-700">
                No products found for this platform/letter combination.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

