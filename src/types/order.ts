export interface OrderLine {
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

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  username: string;
  createdAt: string;
  lineItemCount: number;
  totalQuantity: number;
  totalAmount: number;
  items: OrderLine[];
}

