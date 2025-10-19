export interface Order {
    id: number;
    customer: {
        name: string;
        email: string;
        contact_number?: string;
    };
    total_amount: number;
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
        };
        category: string;
        quantity: number;
    }>;
    is_urgent?: boolean;
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
