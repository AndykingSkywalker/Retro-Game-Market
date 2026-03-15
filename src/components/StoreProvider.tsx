"use client";

import {
  addItemToCart,
  clearCartByUserId,
  createUser,
  getCartByUserId,
  getErrorMessage,
  getMe,
  login,
  removeItemFromCart,
  updateUser,
} from "@/lib/api";
import { clearSession, getToken, saveSession } from "@/lib/auth";
import type { UserCartSummary } from "@/types/cart";
import type { User, UserCreateRequest, UserUpdateRequest } from "@/types/user";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface StoreContextValue {
  user: User | null;
  cart: UserCartSummary | null;
  isLoading: boolean;
  isCartOpen: boolean;
  errorMessage: string | null;
  setIsCartOpen: (value: boolean) => void;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (payload: UserCreateRequest) => Promise<void>;
  signOut: () => void;
  refreshCart: () => Promise<void>;
  addToCart: (itemId: number, quantity?: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  updateProfile: (payload: UserUpdateRequest) => Promise<void>;
  clearError: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<UserCartSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }

    try {
      const nextCart = await getCartByUserId(user.id);
      setCart(nextCart);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }, [user]);

  const hydrateSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setCart(null);
      setIsLoading(false);
      return;
    }

    try {
      const me = await getMe();
      setUser(me);
      const nextCart = await getCartByUserId(me.id);
      setCart(nextCart);
    } catch {
      clearSession();
      setUser(null);
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  const signIn = useCallback(async (username: string, password: string) => {
    try {
      const authResponse = await login({ username, password });
      saveSession(authResponse.token, authResponse.role);
      const me = await getMe();
      setUser(me);
      const nextCart = await getCartByUserId(me.id);
      setCart(nextCart);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      throw error;
    }
  }, []);

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
      setCart(nextCart);
      setIsCartOpen(true);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      throw error;
    }
  }, [user]);

  const removeFromCart = useCallback(async (itemId: number) => {
    if (!user) return;

    try {
      await removeItemFromCart(user.id, itemId);
      const nextCart = await getCartByUserId(user.id);
      setCart(nextCart);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }, [user]);

  const clearCart = useCallback(async () => {
    if (!user) return;

    try {
      await clearCartByUserId(user.id);
      const nextCart = await getCartByUserId(user.id);
      setCart(nextCart);
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
      isLoading,
      isCartOpen,
      errorMessage,
      setIsCartOpen,
      signIn,
      signUp,
      signOut,
      refreshCart,
      addToCart,
      removeFromCart,
      clearCart,
      updateProfile,
      clearError,
    }),
    [
      user,
      cart,
      isLoading,
      isCartOpen,
      errorMessage,
      signIn,
      signUp,
      signOut,
      refreshCart,
      addToCart,
      removeFromCart,
      clearCart,
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

