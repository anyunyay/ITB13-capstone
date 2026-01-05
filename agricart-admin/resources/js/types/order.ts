export interface OrderItem {
  id: number;
  product: {
    name: string;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
  };
  quantity: number;
  category: string;
  price_kilo?: number;
  price_pc?: number;
  price_tali?: number;
  unit_price?: number;
}

export interface Order {
  id: number;
  total_amount: number;
  status: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  customer: {
    name: string;
    email: string;
    contact_number?: string;
    address?: string;
    barangay?: string;
    city?: string;
    province?: string;
  };
  admin?: {
    name: string;
  };
  audit_trail: OrderItem[];
}
