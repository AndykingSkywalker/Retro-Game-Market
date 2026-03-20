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
import type { Order, OrderLine } from "@/types/order";
import type {
  UserWishlistSummary,
  WishlistAddItemRequest,
  WishlistItemSummary,
} from "@/types/wishlist";
import { getToken } from "@/lib/auth";

interface ItemResponseDto {
  id: number;
  itemName: string;
  console: string;
  genre: string;
  stockLevel: number;
  price: number;
  imageUrl?: string;
  inStock: boolean;
  onSale: boolean;
  saleDiscountPercent?: number;
}

interface ItemWriteDto {
  itemName: string;
  console: string;
  genre: string;
  stockLevel: number;
  price: number;
  imageUrl?: string;
  onSale: boolean;
  saleDiscountPercent?: number;
}

interface UserResponseDto {
  id: number;
  username: string;
  email: string;
  profilePicture?: string;
  role: "CUSTOMER" | "ADMIN";
}

interface UserWriteDto {
  username?: string;
  email?: string;
  password?: string;
  profilePicture?: string;
}

interface CartItemSummaryDto {
  itemId: number;
  itemName: string;
  console: string;
  genre: string;
  price: number;
  quantity: number;
}

interface UserCartSummaryDto {
  userId: number;
  username: string;
  email: string;
  items: CartItemSummaryDto[];
  total: number;
}

interface WishlistAddItemRequestDto {
  itemId: number;
}

interface WishlistItemSummaryDto {
  itemId: number;
  itemName: string;
  console: string;
  genre: string;
  price: number;
  imageUrl?: string;
  onSale: boolean;
  saleDiscountPercent?: number;
}

interface UserWishlistSummaryDto {
  userId: number;
  username: string;
  email: string;
  items: WishlistItemSummaryDto[];
}

interface OrderLineResponseDto {
  itemId: number;
  itemName: string;
  console: string;
  genre: string;
  imageUrl?: string;
  unitPrice: number;
  onSale: boolean;
  saleDiscountPercent?: number;
  discountedUnitPrice?: number;
  quantity: number;
  lineTotal: number;
}

interface OrderResponseDto {
  id: number;
  orderNumber: string;
  userId: number;
  username: string;
  createdAt: string;
  lineItemCount: number;
  totalQuantity: number;
  totalAmount: number;
  items: OrderLineResponseDto[];
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8088";

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function mapItemResponseToProduct(item: ItemResponseDto): Product {
  return {
    id: item.id,
    itemName: item.itemName,
    console: item.console,
    genre: item.genre,
    stockLevel: item.stockLevel,
    price: item.price,
    imageUrl: item.imageUrl,
    inStock: item.inStock,
    onSale: item.onSale,
    saleDiscountPercent: item.saleDiscountPercent ?? 0,
  };
}

function toItemWriteDto(payload: ProductCreateRequest | ProductUpdateRequest): ItemWriteDto {
  return {
    itemName: payload.itemName,
    console: payload.console,
    genre: payload.genre,
    stockLevel: payload.stockLevel,
    price: payload.price,
    imageUrl: payload.imageUrl?.trim() ? payload.imageUrl : undefined,
    onSale: payload.onSale,
    saleDiscountPercent: payload.onSale ? payload.saleDiscountPercent ?? 0 : 0,
  };
}

function mapUserResponseToUser(user: UserResponseDto): User {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    profilePicture: user.profilePicture?.trim() ? user.profilePicture : undefined,
    role: user.role,
  };
}

function toUserWriteDto(payload: UserCreateRequest | UserUpdateRequest): UserWriteDto {
  return {
    username: payload.username,
    email: payload.email,
    password: payload.password,
    profilePicture: payload.profilePicture?.trim() ? payload.profilePicture : undefined,
  };
}

function mapCartSummaryDto(cart: UserCartSummaryDto): UserCartSummary {
  return {
    userId: cart.userId,
    username: cart.username,
    email: cart.email,
    items: cart.items.map((item) => ({
      itemId: item.itemId,
      itemName: item.itemName,
      console: item.console,
      genre: item.genre,
      price: item.price,
      quantity: item.quantity,
    })),
    total: cart.total,
  };
}

function mapOrderLineDto(item: OrderLineResponseDto): OrderLine {
  return {
    itemId: item.itemId,
    itemName: item.itemName,
    console: item.console,
    genre: item.genre,
    imageUrl: item.imageUrl,
    unitPrice: item.unitPrice,
    onSale: item.onSale,
    saleDiscountPercent: item.saleDiscountPercent ?? 0,
    discountedUnitPrice: item.discountedUnitPrice,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
  };
}

function mapOrderDto(order: OrderResponseDto): Order {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    username: order.username,
    createdAt: order.createdAt,
    lineItemCount: order.lineItemCount,
    totalQuantity: order.totalQuantity,
    totalAmount: order.totalAmount,
    items: order.items.map(mapOrderLineDto),
  };
}

function mapWishlistItemDto(item: WishlistItemSummaryDto): WishlistItemSummary {
  return {
    itemId: item.itemId,
    itemName: item.itemName,
    console: item.console,
    genre: item.genre,
    price: item.price,
    imageUrl: item.imageUrl,
    onSale: item.onSale,
    saleDiscountPercent: item.saleDiscountPercent ?? 0,
  };
}

function mapWishlistSummaryDto(wishlist: UserWishlistSummaryDto): UserWishlistSummary {
  return {
    userId: wishlist.userId,
    username: wishlist.username,
    email: wishlist.email,
    items: wishlist.items.map(mapWishlistItemDto),
  };
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
  const items = await apiRequest<ItemResponseDto[]>("/api/items", { method: "GET" });
  return items.map(mapItemResponseToProduct);
}

export async function createItem(payload: ProductCreateRequest): Promise<Product> {
  const created = await apiRequest<ItemResponseDto>(
    "/api/items",
    {
      method: "POST",
      body: JSON.stringify(toItemWriteDto(payload)),
    },
    true,
  );

  return mapItemResponseToProduct(created);
}

export async function updateItem(
  id: number,
  payload: ProductUpdateRequest,
): Promise<Product> {
  const updated = await apiRequest<ItemResponseDto>(
    `/api/items/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(toItemWriteDto(payload)),
    },
    true,
  );

  return mapItemResponseToProduct(updated);
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
  const created = await apiRequest<UserResponseDto>(
    "/api/users",
    {
      method: "POST",
      body: JSON.stringify(toUserWriteDto(payload)),
    },
    false,
  );

  return mapUserResponseToUser(created);
}

export async function getMe(): Promise<User> {
  const me = await apiRequest<UserResponseDto>("/api/auth/me", { method: "GET" }, true);
  return mapUserResponseToUser(me);
}

export async function updateUser(
  id: number,
  payload: UserUpdateRequest,
): Promise<User> {
  const updated = await apiRequest<UserResponseDto>(
    `/api/users/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(toUserWriteDto(payload)),
    },
    true,
  );

  return mapUserResponseToUser(updated);
}

export async function getCartByUserId(userId: number): Promise<UserCartSummary> {
  const cart = await apiRequest<UserCartSummaryDto>(`/api/carts/users/${userId}`, { method: "GET" }, true);
  return mapCartSummaryDto(cart);
}

export async function addItemToCart(
  userId: number,
  payload: CartAddItemRequest,
): Promise<UserCartSummary> {
  const cart = await apiRequest<UserCartSummaryDto>(
    `/api/carts/users/${userId}/items`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true,
  );

  return mapCartSummaryDto(cart);
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

export async function checkout(userId: number): Promise<Order> {
  const placed = await apiRequest<OrderResponseDto>(
    `/api/orders/users/${userId}/checkout`,
    {
      method: "POST",
    },
    true,
  );

  return mapOrderDto(placed);
}

export async function getOrderHistory(userId: number): Promise<Order[]> {
  const orders = await apiRequest<OrderResponseDto[]>(
    `/api/orders/users/${userId}`,
    { method: "GET" },
    true,
  );

  return orders.map(mapOrderDto);
}

export async function getWishlistByUserId(userId: number): Promise<UserWishlistSummary> {
  const wishlist = await apiRequest<UserWishlistSummaryDto>(
    `/api/wishlists/users/${userId}`,
    { method: "GET" },
    true,
  );

  return mapWishlistSummaryDto(wishlist);
}

export async function addItemToWishlist(
  userId: number,
  payload: WishlistAddItemRequest,
): Promise<UserWishlistSummary> {
  const requestBody: WishlistAddItemRequestDto = { itemId: payload.itemId };
  const wishlist = await apiRequest<UserWishlistSummaryDto>(
    `/api/wishlists/users/${userId}/items`,
    {
      method: "POST",
      body: JSON.stringify(requestBody),
    },
    true,
  );

  return mapWishlistSummaryDto(wishlist);
}

export async function removeItemFromWishlist(userId: number, itemId: number): Promise<void> {
  await apiRequest<void>(
    `/api/wishlists/users/${userId}/items/${itemId}`,
    {
      method: "DELETE",
    },
    true,
  );
}

export async function clearWishlistByUserId(userId: number): Promise<void> {
  await apiRequest<void>(
    `/api/wishlists/users/${userId}`,
    {
      method: "DELETE",
    },
    true,
  );
}

export { ApiError };

