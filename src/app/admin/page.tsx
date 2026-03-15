"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useStore } from "@/components/StoreProvider";
import { createItem, getErrorMessage, getItems, updateItem } from "@/lib/api";
import type { Product, ProductCreateRequest, ProductUpdateRequest } from "@/types/product";

const DISCOUNT_OPTIONS = [0, 10, 20, 30, 40, 50, 60, 70, 80];

function toUpdatePayload(product: Product): ProductUpdateRequest {
  return {
    itemName: product.itemName,
    console: product.console,
    genre: product.genre,
    stockLevel: product.stockLevel,
    price: product.price,
    imageUrl: product.imageUrl,
    onSale: product.onSale,
    saleDiscountPercent: product.saleDiscountPercent ?? 0,
  };
}

const emptyCreateForm: ProductCreateRequest = {
  itemName: "",
  console: "",
  genre: "",
  stockLevel: 0,
  price: 0,
  imageUrl: "",
  onSale: false,
  saleDiscountPercent: 0,
};

export default function AdminPage() {
  const { user, isLoading } = useStore();
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [consoleFilter, setConsoleFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [saleOnly, setSaleOnly] = useState(false);
  const [drafts, setDrafts] = useState<Record<number, ProductUpdateRequest>>({});
  const [createForm, setCreateForm] = useState<ProductCreateRequest>(emptyCreateForm);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    setIsFetching(true);
    try {
      const nextItems = await getItems();
      setItems(nextItems);
      setDrafts(Object.fromEntries(nextItems.map((item) => [item.id, toUpdatePayload(item)])));
      setError(null);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsFetching(false);
    }
  }

  useEffect(() => {
    if (user?.role === "ADMIN") {
      loadItems();
    }
  }, [user?.role]);

  const consoles = useMemo(
    () => ["all", ...new Set(items.map((item) => item.console).filter(Boolean))],
    [items],
  );

  const genres = useMemo(
    () => ["all", ...new Set(items.map((item) => item.genre).filter(Boolean))],
    [items],
  );

  const visibleItems = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return items.filter((item) => {
      const nameMatch = item.itemName.toLowerCase().includes(needle);
      const consoleMatch = consoleFilter === "all" || item.console === consoleFilter;
      const genreMatch = genreFilter === "all" || item.genre === genreFilter;
      const saleMatch = !saleOnly || item.onSale;
      return nameMatch && consoleMatch && genreMatch && saleMatch;
    });
  }, [items, search, consoleFilter, genreFilter, saleOnly]);

  function handleDraftChange(
    itemId: number,
    field: keyof ProductUpdateRequest,
    value: string | number | boolean,
  ) {
    setDrafts((previous) => ({
      ...previous,
      [itemId]: {
        ...previous[itemId],
        [field]: value,
      },
    }));
  }

  async function handleSave(itemId: number) {
    const payload = drafts[itemId];
    if (!payload) return;

    setSavingId(itemId);
    try {
      await updateItem(itemId, payload);
      await loadItems();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSavingId(null);
    }
  }

  function handleCreateChange(
    field: keyof ProductCreateRequest,
    value: string | number | boolean,
  ) {
    setCreateForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    try {
      await createItem({
        ...createForm,
        imageUrl: createForm.imageUrl?.trim() ? createForm.imageUrl : undefined,
      });
      setCreateForm(emptyCreateForm);
      setIsCreateOpen(false);
      await loadItems();
    } catch (createError) {
      setError(getErrorMessage(createError));
    } finally {
      setIsCreating(false);
    }
  }

  function clearFilters() {
    setSearch("");
    setConsoleFilter("all");
    setGenreFilter("all");
    setSaleOnly(false);
  }

  function isRowDirty(item: Product, draft: ProductUpdateRequest): boolean {
    return (
      item.itemName !== draft.itemName ||
      item.console !== draft.console ||
      item.genre !== draft.genre ||
      item.price !== draft.price ||
      item.stockLevel !== draft.stockLevel ||
      (item.imageUrl ?? "") !== (draft.imageUrl ?? "") ||
      item.onSale !== draft.onSale ||
      (item.saleDiscountPercent ?? 0) !== (draft.saleDiscountPercent ?? 0)
    );
  }

  const onSaleCount = useMemo(() => items.filter((item) => item.onSale).length, [items]);
  const outOfStockCount = useMemo(() => items.filter((item) => !item.inStock).length, [items]);

  if (isLoading) {
    return <p>Loading account...</p>;
  }

  if (!user) {
    return (
      <section className="ui-card p-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Admin</h1>
        <p className="mt-2 text-zinc-700">Please log in as an admin user.</p>
      </section>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <section className="ui-card p-6">
        <h1 className="text-2xl font-semibold text-zinc-900">Admin</h1>
        <p className="mt-2 text-zinc-700">You do not have permission to view this page.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Admin Inventory</h1>
          <p className="mt-1 text-zinc-700">Search, edit, and publish products from one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="ui-button-secondary"
            onClick={() => void loadItems()}
            disabled={isFetching}
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
          <button
            type="button"
            className="ui-button"
            onClick={() => setIsCreateOpen((previous) => !previous)}
          >
            {isCreateOpen ? "Close Create Panel" : "Create New Item"}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="ui-card p-3">
          <p className="text-sm ui-muted">Total items</p>
          <p className="text-2xl font-bold text-zinc-900">{items.length}</p>
        </div>
        <div className="ui-card p-3">
          <p className="text-sm ui-muted">On sale</p>
          <p className="text-2xl font-bold text-zinc-900">{onSaleCount}</p>
        </div>
        <div className="ui-card p-3">
          <p className="text-sm ui-muted">Out of stock</p>
          <p className="text-2xl font-bold text-zinc-900">{outOfStockCount}</p>
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert" aria-live="assertive">
          {error}
        </p>
      ) : null}

      {isCreateOpen ? (
        <form onSubmit={handleCreate} className="ui-card space-y-3 p-4">
          <h2 className="text-xl font-semibold text-zinc-900">Create Item</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              value={createForm.itemName}
              onChange={(event) => handleCreateChange("itemName", event.target.value)}
              placeholder="Item name"
              className="ui-input"
              aria-label="New item name"
              required
            />
            <input
              value={createForm.console}
              onChange={(event) => handleCreateChange("console", event.target.value)}
              placeholder="Console"
              className="ui-input"
              aria-label="New item console"
              required
            />
            <input
              value={createForm.genre}
              onChange={(event) => handleCreateChange("genre", event.target.value)}
              placeholder="Genre"
              className="ui-input"
              aria-label="New item genre"
              required
            />
            <input
              type="number"
              min={0}
              step="0.01"
              value={createForm.price}
              onChange={(event) => handleCreateChange("price", Number(event.target.value))}
              placeholder="Price"
              className="ui-input"
              aria-label="New item price"
              required
            />
            <input
              type="number"
              min={0}
              value={createForm.stockLevel}
              onChange={(event) => handleCreateChange("stockLevel", Number(event.target.value))}
              placeholder="Stock"
              className="ui-input"
              aria-label="New item stock level"
              required
            />
            <input
              value={createForm.imageUrl ?? ""}
              onChange={(event) => handleCreateChange("imageUrl", event.target.value)}
              placeholder="Image URL"
              className="ui-input"
              aria-label="New item image URL"
            />
            <label className="flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 font-semibold text-zinc-900">
              <input
                type="checkbox"
                checked={createForm.onSale}
                onChange={(event) => {
                  const checked = event.target.checked;
                  handleCreateChange("onSale", checked);
                  if (!checked) {
                    handleCreateChange("saleDiscountPercent", 0);
                  } else if (!createForm.saleDiscountPercent) {
                    handleCreateChange("saleDiscountPercent", 10);
                  }
                }}
              />
              On sale
            </label>
            <label className="ui-label">
              Sale discount
              <select
                value={createForm.saleDiscountPercent ?? 0}
                onChange={(event) =>
                  handleCreateChange("saleDiscountPercent", Number(event.target.value))
                }
                className="ui-select"
                disabled={!createForm.onSale}
                aria-label="New item sale discount"
              >
                {DISCOUNT_OPTIONS.map((value) => (
                  <option key={value} value={value}>
                    {value === 0 ? "No discount" : `${value}% off`}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isCreating}
              className="ui-button disabled:opacity-60"
            >
              {isCreating ? "Creating..." : "Create Item"}
            </button>
            <button
              type="button"
              className="ui-button-secondary"
              onClick={() => setCreateForm(emptyCreateForm)}
            >
              Reset
            </button>
          </div>
        </form>
      ) : null}

      <div className="ui-card grid gap-3 p-4 sm:grid-cols-5">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by item name"
          className="ui-input sm:col-span-2"
          aria-label="Search items by name"
        />
        <select
          value={consoleFilter}
          onChange={(event) => setConsoleFilter(event.target.value)}
          className="ui-select"
          aria-label="Filter by console"
        >
          {consoles.map((consoleName) => (
            <option key={consoleName} value={consoleName}>
              {consoleName}
            </option>
          ))}
        </select>
        <select
          value={genreFilter}
          onChange={(event) => setGenreFilter(event.target.value)}
          className="ui-select"
          aria-label="Filter by genre"
        >
          {genres.map((genreName) => (
            <option key={genreName} value={genreName}>
              {genreName}
            </option>
          ))}
        </select>
        <label className="sm:col-span-4 flex items-center gap-2 font-semibold text-zinc-900">
          <input
            type="checkbox"
            checked={saleOnly}
            onChange={(event) => setSaleOnly(event.target.checked)}
          />
          Show on-sale items only
        </label>
        <div className="sm:col-span-1 flex justify-end">
          <button type="button" onClick={clearFilters} className="ui-button-secondary">
            Clear filters
          </button>
        </div>
      </div>

      {isFetching ? <p>Loading items...</p> : null}

      {!isFetching ? (
        <div className="ui-card overflow-x-auto p-0">
          {visibleItems.length > 0 ? (
            <table className="min-w-[980px] w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-700">
                  <th className="px-3 py-3 font-semibold">Item</th>
                  <th className="px-3 py-3 font-semibold">Console</th>
                  <th className="px-3 py-3 font-semibold">Genre</th>
                  <th className="px-3 py-3 font-semibold">Price</th>
                  <th className="px-3 py-3 font-semibold">Stock</th>
                  <th className="px-3 py-3 font-semibold">Image URL</th>
                  <th className="px-3 py-3 font-semibold">In Stock</th>
                  <th className="px-3 py-3 font-semibold">On Sale</th>
                  <th className="px-3 py-3 font-semibold">Discount</th>
                  <th className="px-3 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleItems.map((item) => {
                  const draft = drafts[item.id] ?? toUpdatePayload(item);
                  const isDirty = isRowDirty(item, draft);
                  return (
                    <tr key={item.id} className="border-b border-zinc-200 align-top">
                      <td className="px-3 py-2">
                        <input
                          value={draft.itemName}
                          onChange={(event) => handleDraftChange(item.id, "itemName", event.target.value)}
                          className="ui-input mt-0"
                          aria-label={`Item ${item.id} name`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={draft.console}
                          onChange={(event) => handleDraftChange(item.id, "console", event.target.value)}
                          className="ui-input mt-0"
                          aria-label={`Item ${item.id} console`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={draft.genre}
                          onChange={(event) => handleDraftChange(item.id, "genre", event.target.value)}
                          className="ui-input mt-0"
                          aria-label={`Item ${item.id} genre`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={draft.price}
                          onChange={(event) => handleDraftChange(item.id, "price", Number(event.target.value))}
                          className="ui-input mt-0"
                          aria-label={`Item ${item.id} price`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          value={draft.stockLevel}
                          onChange={(event) => handleDraftChange(item.id, "stockLevel", Number(event.target.value))}
                          className="ui-input mt-0"
                          aria-label={`Item ${item.id} stock level`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={draft.imageUrl ?? ""}
                          onChange={(event) => handleDraftChange(item.id, "imageUrl", event.target.value)}
                          className="ui-input mt-0"
                          placeholder="https://..."
                          aria-label={`Item ${item.id} image URL`}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                            draft.stockLevel > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {draft.stockLevel > 0 ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <label className="inline-flex items-center gap-2 font-semibold">
                          <input
                            type="checkbox"
                            checked={draft.onSale}
                            onChange={(event) => {
                              const checked = event.target.checked;
                              handleDraftChange(item.id, "onSale", checked);
                              if (!checked) {
                                handleDraftChange(item.id, "saleDiscountPercent", 0);
                              } else if (!(draft.saleDiscountPercent ?? 0)) {
                                handleDraftChange(item.id, "saleDiscountPercent", 10);
                              }
                            }}
                          />
                          Yes
                        </label>
                      </td>
                      <td className="px-3 py-2">
                        <select
                          value={draft.saleDiscountPercent ?? 0}
                          onChange={(event) =>
                            handleDraftChange(item.id, "saleDiscountPercent", Number(event.target.value))
                          }
                          className="ui-select mt-0"
                          disabled={!draft.onSale}
                          aria-label={`Item ${item.id} sale discount`}
                        >
                          {DISCOUNT_OPTIONS.map((value) => (
                            <option key={value} value={value}>
                              {value === 0 ? "No discount" : `${value}% off`}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleSave(item.id)}
                          disabled={savingId === item.id || !isDirty}
                          className="ui-button disabled:opacity-50"
                        >
                          {savingId === item.id ? "Saving..." : isDirty ? "Save" : "Saved"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="p-4 text-zinc-700">No items match the current filters.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
