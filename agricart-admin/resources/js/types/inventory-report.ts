export interface Product {
  id: number;
  name: string;
  price_kilo?: number;
  price_pc?: number;
  price_tali?: number;
  description: string;
  image: string;
  image_url?: string;
  produce_type: string;
}

export interface Member {
  id: number;
  name: string;
  email: string;
  contact_number?: string;
  address?: string;
  type: string;
}

export interface Stock {
  id: number;
  product_id: number;
  quantity: number;
  member_id: number;
  category: 'Kilo' | 'Pc' | 'Tali';
  status: string;
  removed_at?: string;
  notes?: string;
  created_at: string;
  product: Product;
  member: Member;
}

export interface ReportSummary {
  total_stocks: number;
  total_quantity: number;
  available_stocks: number;
  available_quantity: number;
  sold_stocks: number;
  sold_quantity: number;
  completely_sold_stocks: number;
  removed_stocks: number;
  total_products: number;
  total_members: number;
}

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  category: string;
  status: string;
  member_ids: string[];
  product_type: string;
  min_quantity?: string;
  max_quantity?: string;
  search?: string;
}
