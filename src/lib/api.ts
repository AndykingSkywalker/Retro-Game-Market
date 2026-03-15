import type {
  CartAddItemRequest,
  UserCartSummary,
} from "@/types/cart";
import type {
  AuthTokenResponse,
  LoginRequest,
  User,
  UserCreateRequest,
  UserUpdateRequest,
} from "@/types/user";
import type {
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
} from "@/types/product";
import { getToken } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8088";

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = false,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (requireAuth) {
    const token = getToken();
    if (!token) {
      throw new ApiError(401, "You need to log in first.");
    }
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`;
    let errorMessage = fallbackMessage;

    try {
      const body = await response.text();
      if (body) {
        errorMessage = body;
      }
    } catch {
      errorMessage = fallbackMessage;
    }

    throw new ApiError(response.status, errorMessage);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unexpected error. Please try again.";
}

export async function getItems(): Promise<Product[]> {
  return apiRequest<Product[]>("/api/items", { method: "GET" });
}

export async function createItem(payload: ProductCreateRequest): Promise<Product> {
  return apiRequest<Product>(
    "/api/items",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true,
  );
}

export async function updateItem(
  id: number,
  payload: ProductUpdateRequest,
): Promise<Product> {
  return apiRequest<Product>(
    `/api/items/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    true,
  );
}

export async function login(payload: LoginRequest): Promise<AuthTokenResponse> {
  return apiRequest<AuthTokenResponse>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    false,
  );
}

export async function createUser(payload: UserCreateRequest): Promise<User> {
  return apiRequest<User>(
    "/api/users",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    false,
  );
}

export async function getMe(): Promise<User> {
  return apiRequest<User>("/api/auth/me", { method: "GET" }, true);
}

export async function updateUser(
  id: number,
  payload: UserUpdateRequest,
): Promise<User> {
  return apiRequest<User>(
    `/api/users/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    true,
  );
}

export async function getCartByUserId(userId: number): Promise<UserCartSummary> {
  return apiRequest<UserCartSummary>(`/api/carts/users/${userId}`, { method: "GET" }, true);
}

export async function addItemToCart(
  userId: number,
  payload: CartAddItemRequest,
): Promise<UserCartSummary> {
  return apiRequest<UserCartSummary>(
    `/api/carts/users/${userId}/items`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true,
  );
}

export async function removeItemFromCart(
  userId: number,
  itemId: number,
): Promise<void> {
  await apiRequest<void>(
    `/api/carts/users/${userId}/items/${itemId}`,
    {
      method: "DELETE",
    },
    true,
  );
}

export async function clearCartByUserId(userId: number): Promise<void> {
  await apiRequest<void>(
    `/api/carts/users/${userId}`,
    {
      method: "DELETE",
    },
    true,
  );
}

export { ApiError };

