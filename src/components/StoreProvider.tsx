"use client";

import {
  addItemToCart,
  addItemToWishlist,
  clearCartByUserId,
  clearWishlistByUserId,
  createUser,
  getItems,
  getCartByUserId,
  getErrorMessage,
  getMe,
  getWishlistByUserId,
  login,
  removeItemFromCart,
  removeItemFromWishlist,
  updateUser,
} from "@/lib/api";
import { clearSession, getToken, saveSession } from "@/lib/auth";
import type { UserCartSummary } from "@/types/cart";
import type { User, UserCreateRequest, UserUpdateRequest } from "@/types/user";
import type { UserWishlistSummary } from "@/types/wishlist";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface AppToast {
  id: number;
  message: string;
  tone?: "info" | "success" | "warning";
}

const MAX_VISIBLE_TOASTS = 3;

interface StoreContextValue {
  user: User | null;
  cart: UserCartSummary | null;
  wishlist: UserWishlistSummary | null;
  isLoading: boolean;
  isCartOpen: boolean;
  errorMessage: string | null;
  toasts: AppToast[];
  setIsCartOpen: (value: boolean) => void;
  showToast: (message: string, tone?: AppToast["tone"]) => void;
  dismissToast: (id: number) => void;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (payload: UserCreateRequest) => Promise<void>;
  signOut: () => void;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
  addToCart: (itemId: number, quantity?: number) => Promise<void>;
  toggleWishlistItem: (itemId: number) => Promise<boolean>;
  updateCartItemQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  clearWishlist: () => Promise<void>;
  updateProfile: (payload: UserUpdateRequest) => Promise<void>;
  clearError: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<UserCartSummary | null>(null);
  const [wishlist, setWishlist] = useState<UserWishlistSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toasts, setToasts] = useState<AppToast[]>([]);
  const nextToastIdRef = useRef(1);
  const toastTimeoutsRef = useRef<Map<number, number>>(new Map());

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const dismissToast = useCallback((id: number) => {
    const timeoutId = toastTimeoutsRef.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      toastTimeoutsRef.current.delete(id);
    }

    setToasts((previous) => previous.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message: string, tone: AppToast["tone"] = "info") => {
    const id = nextToastIdRef.current++;
    setToasts((previous) => {
      const next = [...previous, { id, message, tone }];
      if (next.length <= MAX_VISIBLE_TOASTS) {
        return next;
      }

      const overflowCount = next.length - MAX_VISIBLE_TOASTS;
      const removed = next.slice(0, overflowCount);
      for (const toast of removed) {
        const timeoutId = toastTimeoutsRef.current.get(toast.id);
        if (timeoutId) {
          window.clearTimeout(timeoutId);
          toastTimeoutsRef.current.delete(toast.id);
        }
      }

      return next.slice(overflowCount);
    });

    const timeoutId = window.setTimeout(() => {
      setToasts((previous) => previous.filter((toast) => toast.id !== id));
      toastTimeoutsRef.current.delete(id);
    }, 2300);

    toastTimeoutsRef.current.set(id, timeoutId);
  }, []);

  useEffect(() => {
    const timeoutMap = toastTimeoutsRef.current;

    return () => {
      for (const timeoutId of timeoutMap.values()) {
        window.clearTimeout(timeoutId);
      }
      timeoutMap.clear();
    };
  }, []);

  const applySalePricing = useCallback(async (nextCart: UserCartSummary): Promise<UserCartSummary> => {
    try {
      const products = await getItems();
      const productById = new Map(products.map((product) => [product.id, product]));

      const items = nextCart.items.map((cartItem) => {
        const product = productById.get(cartItem.itemId);
        if (!product) return cartItem;

        const discount = product.onSale ? product.saleDiscountPercent ?? 0 : 0;
        const discountedPrice = discount > 0
          ? Math.max(0, product.price * (1 - discount / 100))
          : product.price;

        return {
          ...cartItem,
          price: Number(discountedPrice.toFixed(2)),
        };
      });

      const total = Number(
        items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2),
      );

      return {
        ...nextCart,
        items,
        total,
      };
    } catch {
      return nextCart;
    }
  }, []);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }

    try {
      const nextCart = await getCartByUserId(user.id);
      setCart(await applySalePricing(nextCart));
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }, [applySalePricing, user]);

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setWishlist(null);
      return;
    }

    try {
      const nextWishlist = await getWishlistByUserId(user.id);
      setWishlist(nextWishlist);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }, [user]);

  const hydrateSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setCart(null);
      setWishlist(null);
      setIsLoading(false);
      return;
    }

    try {
      const me = await getMe();
      setUser(me);
      const [nextCart, nextWishlist] = await Promise.all([
        getCartByUserId(me.id),
        getWishlistByUserId(me.id),
      ]);
      setCart(await applySalePricing(nextCart));
      setWishlist(nextWishlist);
    } catch {
      clearSession();
      setUser(null);
      setCart(null);
      setWishlist(null);
    } finally {
      setIsLoading(false);
    }
  }, [applySalePricing]);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  const signIn = useCallback(async (username: string, password: string) => {
    try {
      const authResponse = await login({ username, password });
      saveSession(authResponse.token, authResponse.role);
      const me = await getMe();
      setUser(me);
      const [nextCart, nextWishlist] = await Promise.all([
        getCartByUserId(me.id),
        getWishlistByUserId(me.id),
      ]);
      setCart(await applySalePricing(nextCart));
      setWishlist(nextWishlist);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      throw error;
    }
  }, [applySalePricing]);

  const signUp = useCallback(async (payload: UserCreateRequest) => {
    try {
      await createUser(payload);
      await signIn(payload.username, payload.password);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      throw error;
    }
  }, [signIn]);

  const signOut = useCallback(() => {
    clearSession();
    setUser(null);
    setCart(null);
    setWishlist(null);
    setIsCartOpen(false);
    setErrorMessage(null);
  }, []);

  const addToCart = useCallback(async (itemId: number, quantity = 1) => {
    if (!user) {
      setErrorMessage("Please log in to add items to your basket.");
      throw new Error("Not authenticated");
    }

    try {
      const nextCart = await addItemToCart(user.id, { itemId, quantity });
      setCart(await applySalePricing(nextCart));
      setIsCartOpen(true);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      throw error;
    }
  }, [applySalePricing, user]);

  const updateCartItemQuantity = useCallback(async (itemId: number, quantity: number) => {
    if (!user) {
      setErrorMessage("Please log in to manage your basket.");
      throw new Error("Not authenticated");
    }

    const currentQuantity = cart?.items.find((item) => item.itemId === itemId)?.quantity ?? 0;
    if (quantity === currentQuantity) {
      return;
    }

    try {
      if (quantity <= 0) {
        if (currentQuantity > 0) {
          await removeItemFromCart(user.id, itemId);
        }
        const nextCart = await getCartByUserId(user.id);
        setCart(await applySalePricing(nextCart));
        setErrorMessage(null);
        return;
      }

      if (quantity > currentQuantity) {
        const nextCart = await addItemToCart(user.id, {
          itemId,
          quantity: quantity - currentQuantity,
        });
        setCart(await applySalePricing(nextCart));
        setErrorMessage(null);
        return;
      }

      await removeItemFromCart(user.id, itemId);
      const nextCart = await addItemToCart(user.id, { itemId, quantity });
      setCart(await applySalePricing(nextCart));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      throw error;
    }
  }, [applySalePricing, cart, user]);

  const toggleWishlistItem = useCallback(async (itemId: number): Promise<boolean> => {
    if (!user) {
      setErrorMessage("Please log in to manage your wishlist.");
      throw new Error("Not authenticated");
    }

    const isAlreadyWishlisted = wishlist?.items.some((item) => item.itemId === itemId) ?? false;

    try {
      if (isAlreadyWishlisted) {
        await removeItemFromWishlist(user.id, itemId);
        const nextWishlist = await getWishlistByUserId(user.id);
        setWishlist(nextWishlist);
        setErrorMessage(null);
        return false;
      }

      const nextWishlist = await addItemToWishlist(user.id, { itemId });
      setWishlist(nextWishlist);
      setErrorMessage(null);
      return true;
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      throw error;
    }
  }, [user, wishlist]);

  const removeFromCart = useCallback(async (itemId: number) => {
    if (!user) return;

    try {
      await removeItemFromCart(user.id, itemId);
      const nextCart = await getCartByUserId(user.id);
      setCart(await applySalePricing(nextCart));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }, [applySalePricing, user]);

  const clearCart = useCallback(async () => {
    if (!user) return;

    try {
      await clearCartByUserId(user.id);
      const nextCart = await getCartByUserId(user.id);
      setCart(await applySalePricing(nextCart));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }, [applySalePricing, user]);

  const clearWishlist = useCallback(async () => {
    if (!user) return;

    try {
      await clearWishlistByUserId(user.id);
      const nextWishlist = await getWishlistByUserId(user.id);
      setWishlist(nextWishlist);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }, [user]);

  const updateProfile = useCallback(async (payload: UserUpdateRequest) => {
    if (!user) return;

    try {
      const updated = await updateUser(user.id, payload);
      setUser(updated);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      throw error;
    }
  }, [user]);

  const value = useMemo<StoreContextValue>(
    () => ({
      user,
      cart,
      wishlist,
      isLoading,
      isCartOpen,
      errorMessage,
      toasts,
      setIsCartOpen,
      showToast,
      dismissToast,
      signIn,
      signUp,
      signOut,
      refreshCart,
      refreshWishlist,
      addToCart,
      toggleWishlistItem,
      updateCartItemQuantity,
      removeFromCart,
      clearCart,
      clearWishlist,
      updateProfile,
      clearError,
    }),
    [
      user,
      cart,
      wishlist,
      isLoading,
      isCartOpen,
      errorMessage,
      toasts,
      signIn,
      signUp,
      signOut,
      refreshCart,
      refreshWishlist,
      showToast,
      dismissToast,
      addToCart,
      toggleWishlistItem,
      updateCartItemQuantity,
      removeFromCart,
      clearCart,
      clearWishlist,
      updateProfile,
      clearError,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
}

