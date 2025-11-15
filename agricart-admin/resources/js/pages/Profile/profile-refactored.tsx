import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import ProfileWrapper from './profile-wrapper';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileDetailsCard } from '@/components/profile/ProfileDetailsCard';
import { ProfileToolsCard } from '@/components/profile/ProfileToolsCard';
import { getProfileTools } from '@/components/profile/config/profile-tools.config';
import ProfileEditModal from '@/components/shared/profile/ProfileEditModal';
import { useTranslation } from '@/hooks/use-translation';

// Utility function to mask phone numbers for security (show only last 3 digits)
const maskPhone = (phone: string): string => {
    if (!phone) return phone;
    
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (digitsOnly.length <= 3) {
        return '*'.repeat(digitsOnly.length);
    } else {
        return '*'.repeat(digitsOnly.length - 3) + digitsOnly.slice(-3);
    }
};

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

interface PageProps {
    user: User;
    [key: string]: any;
}

export default function ProfilePage() {
    const { user } = usePage<PageProps>().props;
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const t = useTranslation();

    // Get profile tools based on user type
    const profileTools = getProfileTools(user?.type || 'customer', t);

    return (
        <ProfileWrapper title={t('ui.profile_information')}>
            <div className="space-y-6">
                {/* Profile Header - Shared across all user types */}
                <ProfileHeader 
                    user={user} 
                    onEditClick={() => setIsEditModalOpen(true)} 
                />

                {/* Profile Details - Contact & Account Information */}
                <ProfileDetailsCard 
                    user={user} 
                    maskPhone={maskPhone} 
                />

                {/* Role-based Tools - Dynamically rendered based on user type */}
                {user?.type && profileTools.length > 0 && (
                    <ProfileToolsCard 
                        userType={user.type}
                        tools={profileTools}
                    />
                )}
            </div>

            {/* Profile Edit Modal */}
            <ProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
            />
        </ProfileWrapper>
    );
}
