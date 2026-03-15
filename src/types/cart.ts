export interface CartItemSummary {
  itemId: number;
  itemName: string;
  console: string;
  genre: string;
  price: number;
  quantity: number;
}

export interface UserCartSummary {
  userId: number;
  username: string;
  email: string;
  items: CartItemSummary[];
  total: number;
}

export interface CartAddItemRequest {
  itemId: number;
  quantity: number;
}

export interface CartUpdateQuantityRequest {
  quantity: number;
}

