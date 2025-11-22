export interface Order {
    id: number;
    customer: {
        name: string;
        email: string;
        contact_number?: string;
    };
    total_amount: number;
    subtotal?: number;
    coop_share?: number;
    member_share?: number;
    status: 'pending' | 'approved' | 'rejected' | 'expired' | 'delayed' | 'cancelled';
    delivery_status: 'pending' | 'ready_to_pickup' | 'out_for_delivery' | 'delivered';
    created_at: string;
    admin?: {
        name: string;
    };
    admin_notes?: string;
    logistic?: {
        id: number;
        name: string;
        contact_number?: string;
    };
    audit_trail: Array<{
        id: number;
        product: {
            id: number;
            name: string;
            price_kilo?: number;
            price_pc?: number;
            price_tali?: number;
        };
        category: string;
        quantity: number;
        unit_price?: number;
        subtotal?: number;
        coop_share?: number;
        available_stock?: number;
        total_amount?: number;
        stock_preview?: {
            current_stock: number;
            quantity_to_deduct: number;
            remaining_stock: number;
            sufficient_stock: boolean;
        };
    }>;
    is_urgent?: boolean;
    is_suspicious?: boolean;
    suspicious_reason?: string;
    delivery_address?: string;
    order_address?: {
        street: string;
        barangay: string;
        city: string;
        province: string;
    };
}

export interface OrderStats {
    totalOrders: number;
    pendingOrders: number;
    approvedOrders: number;
    rejectedOrders: number;
    delayedOrders: number;
}

export interface OrdersPageProps {
    orders: Order[];
    allOrders: Order[];
    currentStatus: string;
    logistics: Array<{
        id: number;
        name: string;
        contact_number?: string;
    }>;
    highlightOrderId?: string;
    urgentOrders?: Order[];
    showUrgentApproval?: boolean;
}
