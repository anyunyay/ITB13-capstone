export interface CartItem {
  item_id: number;
  product_id: number;
  name: string;
  category: string;
  quantity: number;
  available_stock: number | string;
  total_price: number;
}

export interface Address {
  id: number | null;
  street: string;
  barangay: string;
  city: string;
  province: string;
  is_active: boolean;
}
