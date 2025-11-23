export interface LogisticFeedback {
    order_id: number;
    feedback: string;
    rating: number;
    delivered_at: string;
    confirmed_at: string;
}

export interface Logistic {
    id: number;
    name: string;
    email: string;
    contact_number?: string;
    registration_date?: string;
    type: string;
    active: boolean;
    default_address?: {
        id: number;
        street: string;
        barangay: string;
        city: string;
        province: string;
        full_address: string;
    };
    can_be_deactivated: boolean;
    deactivation_reason?: string;
    can_be_deleted: boolean;
    deletion_reason?: string;
    average_rating?: number | null;
    total_ratings?: number;
    total_deliveries?: number;
    feedback?: LogisticFeedback[];
    [key: string]: unknown;
}

export interface LogisticStats {
    totalLogistics: number;
    activeLogistics: number;
    deactivatedLogistics: number;
    pendingRequests: number;
    overallRating: number | null;
    totalRatings: number;
}

export interface LogisticFilters {
    search: string;
    type: string;
    status: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}
