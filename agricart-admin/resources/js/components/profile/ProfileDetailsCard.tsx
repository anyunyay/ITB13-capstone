import { Card, CardContent } from '@/components/ui/card';
import { ContactInformation } from './ContactInformation';
import { AccountInformation } from './AccountInformation';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    contact_number?: string;
    avatar?: string;
    avatar_url?: string;
    type: string;
    created_at?: string;
    updated_at?: string;
    email_verified_at?: string;
    member_id?: string;
    registration_date?: string;
    active?: boolean;
    is_default?: boolean;
    address?: string;
    barangay?: string;
    city?: string;
    province?: string;
    default_address?: {
        id: number;
        street: string;
        barangay: string;
        city: string;
        province: string;
        is_active: boolean;
    };
}

interface ProfileDetailsCardProps {
    user: User;
    maskPhone?: (phone: string) => string;
}

export function ProfileDetailsCard({ user, maskPhone }: ProfileDetailsCardProps) {
    return (
        <Card className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
            <CardContent className="px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    <ContactInformation user={user} maskPhone={maskPhone} />
                    <AccountInformation user={user} />
                </div>
            </CardContent>
        </Card>
    );
}
