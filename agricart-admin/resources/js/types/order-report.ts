export interface Customer {
  name: string;
  email: string;
  contact_number?: string;
  address?: string;
  barangay?: string;
  city?: string;
  province?: string;
}

export interface Admin {
  name: string;
}

export interface Logistic {
  id: number;
  name: string;
  contact_number?: string;
}

export interface AuditTrailItem {
  id: number;
  product: {
    id: number;
    name: string;
  };
  category: string;
  quantity: number;
}

export interface Order {
  id: number;
  customer: Customer;
  total_amount: number;
  subtotal: number;
  coop_share: number;
  member_share: number;
  status: 'pending' | 'approved' | 'rejected' | 'delayed' | 'cancelled';
  delivery_status: 'pending' | 'out_for_delivery' | 'delivered' | 'ready_to_pickup';
  delivery_packed_time?: string;
  delivered_time?: string;
  delivery_timeline?: {
    packed_at?: string;
    delivered_at?: string;
    packing_duration?: number;
    delivery_duration?: number;
    total_duration?: number;
  };
  created_at: string;
  admin?: Admin;
  admin_notes?: string;
  logistic?: Logistic;
  audit_trail: AuditTrailItem[];
}

export interface ReportSummary {
  total_orders: number;
  total_revenue: number;
  total_subtotal: number;
  total_coop_share: number;
  total_member_share: number;
  pending_orders: number;
  approved_orders: number;
  rejected_orders: number;
  delivered_orders: number;
}

export interface AdminStaff {
  id: number;
  name: string;
  email: string;
  type: 'admin' | 'staff';
}

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  status: string;
  delivery_status: string;
  logistic_ids: string[];
  admin_ids: string[];
  search?: string;
  min_amount?: string;
  max_amount?: string;
}
