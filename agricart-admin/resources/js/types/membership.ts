export interface Member {
    id: number;
    name: string;
    member_id?: string;
    contact_number?: string;
    registration_date?: string;
    document?: string;
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
    [key: string]: unknown;
}

export interface PasswordChangeRequest {
    id: number;
    member_id: number;
    status: string;
    requested_at: string;
    processed_at?: string;
    admin_notes?: string;
    member: Member;
    processed_by?: {
        id: number;
        name: string;
    };
}

export interface MemberStats {
    totalMembers: number;
    activeMembers: number;
    deactivatedMembers: number;
    pendingRequests: number;
}
