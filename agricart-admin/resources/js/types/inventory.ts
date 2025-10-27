export interface Product {
    id: number;
    name: string;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
    description: string;
    produce_type: string;
    image: string;
    image_url: string;
    archived_at?: string;
}

export interface Stock {
    id: number;
    product_id: number;
    quantity: number;
    category: string;
    status: string;
    member_id?: number;
    removed_at?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    product?: {
        id: number;
        name: string;
        produce_type: string;
        description: string;
        image: string;
        image_url: string;
    };
    member?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface StockStats {
    totalProducts: number;
    totalStocks: number;
    availableStocks: number;
    lowStockItems: number;
    outOfStockItems: number;
}

export interface RemovedStock {
    id: number;
    product_id: number;
    quantity: number;
    member_id: number;
    category: string;
    status?: string;
    removed_at: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    product?: {
        id: number;
        name: string;
        produce_type: string;
        description: string;
        image: string;
        image_url: string;
    };
    member?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface AuditTrail {
    id: number;
    sale_id?: number;
    order_id?: number;
    stock_id?: number;
    member_id?: number;
    product_id: number;
    product_name?: string;
    category: string;
    quantity: number;
    available_stock_after_sale?: number;
    price_kilo?: number;
    price_pc?: number;
    price_tali?: number;
    unit_price?: number;
    created_at: string;
    updated_at: string;
    product?: {
        id: number;
        name: string;
        produce_type: string;
        description: string;
        image: string;
        image_url: string;
        price_kilo?: number;
        price_pc?: number;
        price_tali?: number;
    };
    stock?: {
        id: number;
        quantity: number;
        category: string;
        member_id?: number;
    };
    sale?: {
        id: number;
        total_amount: number;
        status: string;
    };
    member?: {
        id: number;
        name: string;
        email: string;
    };
}

export interface SoldStock {
    id: number;
    product_id: number;
    quantity: number;
    member_id: number;
    category: string;
    status: string;
    created_at: string;
    updated_at: string;
    product?: {
        id: number;
        name: string;
        produce_type: string;
        description: string;
        image: string;
        image_url: string;
    };
    member?: {
        id: number;
        name: string;
        email: string;
    };
}

// StockTrail interface removed as we're now using AuditTrail for stock history
