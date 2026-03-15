export interface Product {
  id: number;
  itemName: string;
  console: string;
  genre: string;
  stockLevel: number;
  price: number;
  imageUrl?: string;
  inStock: boolean;
  onSale: boolean;
}

export interface ProductFilters {
  genre: string;
  console: string;
  onSaleOnly: boolean;
}

export interface ProductCreateRequest {
  itemName: string;
  console: string;
  genre: string;
  stockLevel: number;
  price: number;
  imageUrl?: string;
  inStock: boolean;
  onSale: boolean;
}

export interface ProductUpdateRequest extends ProductCreateRequest {
  id?: number;
}
