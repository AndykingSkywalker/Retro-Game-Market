"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useStore } from "@/components/StoreProvider";
import { createItem, getErrorMessage, getItems, updateItem } from "@/lib/api";
import type { Product, ProductCreateRequest, ProductUpdateRequest } from "@/types/product";

function toUpdatePayload(product: Product): ProductUpdateRequest {
  return {
    itemName: product.itemName,
    console: product.console,
    genre: product.genre,
    stockLevel: product.stockLevel,
    price: product.price,
    imageUrl: product.imageUrl,
    inStock: product.inStock,
    onSale: product.onSale,
  };
}

const emptyCreateForm: ProductCreateRequest = {
  itemName: "",
  console: "",
  genre: "",
  stockLevel: 0,
  price: 0,
  imageUrl: "",
  inStock: true,
  onSale: false,
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
      await loadItems();
    } catch (createError) {
      setError(getErrorMessage(createError));
    } finally {
      setIsCreating(false);
    }
  }

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
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Admin Inventory</h1>
        <p className="mt-1 text-zinc-700">Search, update, and create store items.</p>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert" aria-live="assertive">
          {error}
        </p>
      ) : null}

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
              checked={createForm.inStock}
              onChange={(event) => handleCreateChange("inStock", event.target.checked)}
            />
            In stock
          </label>
          <label className="flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 font-semibold text-zinc-900">
            <input
              type="checkbox"
              checked={createForm.onSale}
              onChange={(event) => handleCreateChange("onSale", event.target.checked)}
            />
            On sale
          </label>
        </div>
        <button
          type="submit"
          disabled={isCreating}
          className="ui-button disabled:opacity-60"
        >
          {isCreating ? "Creating..." : "Create Item"}
        </button>
      </form>

      <div className="ui-card grid gap-3 p-4 sm:grid-cols-4">
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
      </div>

      {isFetching ? <p>Loading items...</p> : null}

      {!isFetching ? (
        <div className="space-y-3">
          {visibleItems.map((item) => {
            const draft = drafts[item.id] ?? toUpdatePayload(item);
            return (
              <article key={item.id} className="ui-card p-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <input
                    value={draft.itemName}
                    onChange={(event) => handleDraftChange(item.id, "itemName", event.target.value)}
                    className="ui-input"
                    aria-label={`Item ${item.id} name`}
                  />
                  <input
                    value={draft.console}
                    onChange={(event) => handleDraftChange(item.id, "console", event.target.value)}
                    className="ui-input"
                    aria-label={`Item ${item.id} console`}
                  />
                  <input
                    value={draft.genre}
                    onChange={(event) => handleDraftChange(item.id, "genre", event.target.value)}
                    className="ui-input"
                    aria-label={`Item ${item.id} genre`}
                  />
                  <input
                    type="number"
                    min={0}
                    value={draft.price}
                    onChange={(event) => handleDraftChange(item.id, "price", Number(event.target.value))}
                    className="ui-input"
                    aria-label={`Item ${item.id} price`}
                  />
                  <input
                    type="number"
                    min={0}
                    value={draft.stockLevel}
                    onChange={(event) => handleDraftChange(item.id, "stockLevel", Number(event.target.value))}
                    className="ui-input"
                    aria-label={`Item ${item.id} stock level`}
                  />
                  <input
                    value={draft.imageUrl ?? ""}
                    onChange={(event) => handleDraftChange(item.id, "imageUrl", event.target.value)}
                    placeholder="Image URL"
                    className="ui-input"
                    aria-label={`Item ${item.id} image URL`}
                  />
                  <label className="flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 font-semibold text-zinc-900">
                    <input
                      type="checkbox"
                      checked={draft.inStock}
                      onChange={(event) => handleDraftChange(item.id, "inStock", event.target.checked)}
                    />
                    In stock
                  </label>
                  <label className="flex items-center gap-2 rounded-md border border-zinc-300 px-3 py-2 font-semibold text-zinc-900">
                    <input
                      type="checkbox"
                      checked={draft.onSale}
                      onChange={(event) => handleDraftChange(item.id, "onSale", event.target.checked)}
                    />
                    On sale
                  </label>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleSave(item.id)}
                    disabled={savingId === item.id}
                    className="ui-button disabled:opacity-60"
                  >
                    {savingId === item.id ? "Saving..." : "Save"}
                  </button>
                </div>
              </article>
            );
          })}

          {visibleItems.length === 0 ? (
            <p className="rounded-xl border border-zinc-200 bg-white p-4 text-zinc-700">
              No items match the current filters.
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
