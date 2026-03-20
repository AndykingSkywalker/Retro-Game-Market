"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
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
  return (
    <Suspense fallback={<p>Loading products...</p>}>
      <ProductsContent />
    </Suspense>
  );
}

function ProductsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedLetter, setSelectedLetter] = useState<string>("all");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [areFiltersHydrated, setAreFiltersHydrated] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const { cart, wishlist, toggleWishlistItem, updateCartItemQuantity } = useStore();

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
    const queryFromUrl = searchParams.get("q") ?? "";
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
    setSearchQuery((previous) =>
      previous === queryFromUrl ? previous : queryFromUrl,
    );
    if (queryFromUrl) {
      setIsSearchOpen(true);
    }

    setAreFiltersHydrated(true);
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

  const searchedProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return filteredProducts;

    return filteredProducts.filter((product) =>
      product.itemName.toLowerCase().includes(normalizedQuery),
    );
  }, [filteredProducts, searchQuery]);

  const quantitiesByItemId = useMemo(
    () => new Map((cart?.items ?? []).map((item) => [item.itemId, item.quantity])),
    [cart],
  );

  const wishlistedItemIds = useMemo(
    () => new Set((wishlist?.items ?? []).map((item) => item.itemId)),
    [wishlist],
  );

  useEffect(() => {
    if (selectedLetter !== "all" && !availableLetters.has(selectedLetter)) {
      setSelectedLetter("all");
    }
  }, [availableLetters, selectedLetter]);

  useEffect(() => {
    if (!areFiltersHydrated) {
      return;
    }

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

    const normalizedQuery = searchQuery.trim();
    if (!normalizedQuery) {
      nextParams.delete("q");
    } else {
      nextParams.set("q", normalizedQuery);
    }

    const nextQuery = nextParams.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    const currentQuery = searchParams.toString();
    const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;

    if (nextUrl !== currentUrl) {
      router.replace(nextUrl, { scroll: false });
    }
  }, [areFiltersHydrated, pathname, router, searchParams, searchQuery, selectedLetter, selectedPlatform]);

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
          {/* Platform sidebar */}
          <div>
            {/* Mobile toggle button */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen((prev) => !prev)}
              className="lg:hidden ui-button-secondary flex w-full items-center justify-between"
              aria-expanded={isMobileSidebarOpen}
              aria-controls="platform-sidebar"
            >
              <span>
                {selectedPlatform === "all"
                  ? "Filter by Platform"
                  : `Platform: ${selectedPlatform}`}
              </span>
              <span aria-hidden="true">{isMobileSidebarOpen ? "▲" : "▼"}</span>
            </button>

            <aside
              id="platform-sidebar"
              className={`ui-card p-4 mt-2 lg:mt-0 ${isMobileSidebarOpen ? "block" : "hidden"} lg:block`}
            >
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
                        setIsMobileSidebarOpen(false);
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
          </div>

          <div className="space-y-4">
            <div className="ui-card p-4">
              <button
                type="button"
                onClick={() => setIsSearchOpen((previous) => !previous)}
                className="ui-button-secondary flex w-full items-center justify-between"
                aria-expanded={isSearchOpen}
                aria-controls="product-search-panel"
              >
                <span>Search Products</span>
                <span aria-hidden="true">{isSearchOpen ? "-" : "+"}</span>
              </button>

              {isSearchOpen ? (
                <div id="product-search-panel" className="mt-3">
                  <label htmlFor="product-search-input" className="ui-label">
                    Search by game title
                  </label>
                  <input
                    id="product-search-input"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="e.g. Resident Evil"
                    className="ui-input"
                  />
                </div>
              ) : null}
            </div>

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

            {searchedProducts.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {searchedProducts.map((product) => (
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
              <p className="ui-card p-4 text-zinc-700">
                No products found for this platform/letter/search combination.
              </p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

