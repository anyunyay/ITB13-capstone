import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePage } from '@inertiajs/react';
import { User, Edit, Mail, Phone, Calendar, Shield, MapPin } from 'lucide-react';
import ProfileWrapper from './profile-wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProfileEditModal from '@/components/ProfileEditModal';
import { getDisplayEmail } from '@/lib/utils';

// Utility function to mask phone numbers for security (show only last 3 digits)
const maskPhone = (phone: string): string => {
    if (!phone) return phone;
    
    // Remove any non-digit characters for consistent masking
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
    // Address fields
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

    // Generate dynamic routes based on user type
    const getProfileRoutes = () => {
        const userType = user.type;
        const baseRoute = userType === 'customer' ? '/customer' : 
                         userType === 'admin' || userType === 'staff' ? '/admin' :
                         userType === 'logistic' ? '/logistic' :
                         userType === 'member' ? '/member' : '/customer';
        
        return {
            profile: `${baseRoute}/profile`,
            profileInfo: `${baseRoute}/profile/info`,
        };
    };

    const routes = getProfileRoutes();

    // Check if user is admin or staff (should see full phone number)
    const isAdminOrStaff = user?.type === 'admin' || user?.type === 'staff';

    // Get display phone number (masked for non-admin/staff users)
    const displayPhone = isAdminOrStaff ? (user?.contact_number || '') : maskPhone(user?.contact_number || '');
    
    // Get display email (masked for non-admin/staff users)
    const displayEmail = getDisplayEmail(user?.email || '', user?.type);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const getUserTypeLabel = (type: string) => {
        switch (type) {
            case 'admin':
                return 'Administrator';
            case 'staff':
                return 'Staff Member';
            case 'customer':
                return 'Customer';
            case 'logistic':
                return 'Logistics';
            case 'member':
                return 'Member';
            default:
                return 'User';
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not available';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCurrentAddress = () => {
        // First try to get from default_address (from user_addresses table)
        if (user?.default_address) {
            const { street, barangay, city, province } = user.default_address;
            return `${street}, ${barangay}, ${city}, ${province}`;
        }
        
        // Fallback to user's direct address fields
        if (user?.address || user?.barangay || user?.city || user?.province) {
            const parts = [user.address, user.barangay, user.city, user.province].filter(Boolean);
            return parts.join(', ');
        }
        
        return 'No address provided';
    };

    return (
        <ProfileWrapper 
            breadcrumbs={[
                { title: 'Profile Information', href: routes.profileInfo }
            ]}
            title="Profile Information"
        >
            <div className="space-y-6">
                {/* Main Profile Header */}
                <Card className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group">
                    <CardHeader className="bg-gradient-to-r from-muted/80 to-muted/60 backdrop-blur-sm border-b border-border/50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    <Avatar className="h-24 w-24 border-4 border-card/50 shadow-2xl ring-4 ring-border/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-primary/20">
                                        <AvatarImage 
                                            src={user?.avatar_url || undefined} 
                                            alt={user?.name} 
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="text-2xl bg-gradient-to-br from-muted to-muted/60 text-card-foreground font-bold">
                                            {user?.name ? getInitials(user.name) : 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full border-4 border-card shadow-lg flex items-center justify-center">
                                        <Shield className="h-4 w-4 text-primary-foreground" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-bold text-card-foreground">
                                        {user?.name || 'No Name'}
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/10 text-secondary">
                                            <User className="h-3 w-3 mr-1" />
                                            {getUserTypeLabel(user?.type || '')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Member since {formatDate(user?.created_at)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:items-end gap-3">
                                <Button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit Profile
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Contact Information */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-card-foreground flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-secondary/10">
                                        <Mail className="h-5 w-5 text-secondary" />
                                    </div>
                                    Contact Information
                                </h3>
                                <div className="space-y-4">
                                    {user?.type !== 'member' && (
                                        <div className="p-5 bg-muted/80 rounded-xl border border-border/50 hover:bg-muted/60 transition-colors duration-200">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-lg bg-muted">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                                                    <p className="font-medium text-card-foreground text-lg">{displayEmail}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="p-5 bg-muted/80 rounded-xl border border-border/50 hover:bg-muted/60 transition-colors duration-200">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-muted">
                                                <Phone className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-muted-foreground mb-1">Contact Number</p>
                                                <p className="font-medium text-card-foreground text-lg">{displayPhone || 'Not provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-card-foreground flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Shield className="h-5 w-5 text-primary" />
                                    </div>
                                    Account Information
                                </h3>
                                <div className="space-y-4">
                                    {/* Current Address */}
                                    <div className="p-5 bg-muted/80 rounded-xl border border-border/50 hover:bg-muted/60 transition-colors duration-200">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 rounded-lg bg-muted mt-0.5 flex-shrink-0">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-muted-foreground mb-2">Current Address</p>
                                                <p className="font-medium text-card-foreground leading-relaxed text-lg">
                                                    {getCurrentAddress()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Created */}
                                    <div className="p-5 bg-muted/80 rounded-xl border border-border/50 hover:bg-muted/60 transition-colors duration-200">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 rounded-lg bg-muted">
                                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-muted-foreground mb-1">Account Created</p>
                                                <p className="font-medium text-card-foreground text-lg">{formatDate(user?.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
