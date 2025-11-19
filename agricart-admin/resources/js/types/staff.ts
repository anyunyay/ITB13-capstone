export interface Staff {
    id: number;
    name: string;
    email: string;
    contact_number?: string;
    created_at: string;
    email_verified_at?: string;
    active: boolean;
    permissions: Array<{ name: string }>;
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
}

export interface StaffStats {
    totalStaff: number;
    activeStaff: number;
    inactiveStaff: number;
    totalPermissions: number;
    recentStaff: number;
}

export interface StaffFilters {
    search: string;
    sort_by: string;
    sort_order: 'asc' | 'desc';
    per_page: number;
}

export interface StaffPagination {
    data: Staff[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}
