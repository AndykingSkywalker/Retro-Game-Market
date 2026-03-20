export interface WishlistItemSummary {
  itemId: number;
  itemName: string;
  console: string;
  genre: string;
  price: number;
  imageUrl?: string;
  onSale: boolean;
  saleDiscountPercent?: number;
}

export interface UserWishlistSummary {
  userId: number;
  username: string;
  email: string;
  items: WishlistItemSummary[];
}

export interface WishlistAddItemRequest {
  itemId: number;
}

