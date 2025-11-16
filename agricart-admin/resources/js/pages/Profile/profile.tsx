import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePage, Link } from '@inertiajs/react';
import { User, Edit, Mail, Phone, Calendar, Shield, MapPin, CheckCircle, Clock, Activity, Lock, Truck, Package, ArrowLeft } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import LogisticLayout from '@/layouts/logistic-layout';
import MemberLayout from '@/layouts/member-layout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProfileEditModal from '@/components/shared/profile/ProfileEditModal';
import { getDisplayEmail } from '@/lib/utils';
import { useTranslation } from '@/hooks/use-translation';

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
    const t = useTranslation();

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
                return t('admin.administrator');
            case 'staff':
                return t('staff.staff_member');
            case 'customer':
                return t('customer.customer');
            case 'logistic':
                return t('logistic.logistics');
            case 'member':
                return t('member.member');
            default:
                return t('ui.user');
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return t('ui.not_available');
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

        return t('ui.no_address_provided');
    };

    // Check if non-customer user
    const isNonCustomer = user?.type !== 'customer';

    // Profile content component
    const profileContent = (
        <div className="space-y-2">
            {/* Main Profile Header */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="relative">
                                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-border">
                                    <AvatarImage
                                        src={user?.avatar_url || undefined}
                                        alt={user?.name}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="text-lg sm:text-xl bg-muted text-foreground font-semibold">
                                        {user?.name ? getInitials(user.name) : 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-primary rounded-full border-2 border-card flex items-center justify-center">
                                    <Shield className="h-3 w-3 text-primary-foreground" />
                                </div>
                            </div>
                            <div className="space-y-1 text-center sm:text-left">
                                <h1 className="text-lg sm:text-xl font-bold text-foreground">
                                    {user?.name || 'No Name'}
                                </h1>
                                <div className="flex items-center justify-center sm:justify-start gap-2">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary/10 text-secondary">
                                        <User className="h-3 w-3 mr-1" />
                                        {getUserTypeLabel(user?.type || '')}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Member Since {formatDate(user?.created_at)}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                            <Button
                                onClick={() => setIsEditModalOpen(true)}
                                className="flex items-center justify-center gap-2 w-full sm:w-auto"
                            >
                                <Edit className="h-4 w-4" />
                                {t('ui.edit_profile')}
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {/* Contact Information */}
                        <div className="space-y-3">
                            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-secondary/10">
                                    <Mail className="h-4 w-4 text-secondary" />
                                </div>
                                {t('ui.contact_information')}
                            </h3>
                            <div className="space-y-3">
                                {user?.type !== 'member' && (
                                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-md bg-background">
                                                <Mail className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-muted-foreground mb-0.5">Email Address</p>
                                                <p className="font-medium text-foreground">{displayEmail}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-background">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground mb-0.5">Phone Number</p>
                                            <p className="font-medium text-foreground">{displayPhone || 'Not Provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="space-y-3">
                            <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-primary/10">
                                    <Shield className="h-4 w-4 text-primary" />
                                </div>
                                {t('ui.account_information')}
                            </h3>
                            <div className="space-y-3">
                                {/* Current Address */}
                                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 rounded-md bg-background mt-0.5 flex-shrink-0">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground mb-1">{t('ui.current_address')}</p>
                                            <p className="font-medium text-foreground leading-relaxed">
                                                {getCurrentAddress()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Created */}
                                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-background">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground mb-0.5">{t('ui.account_created')}</p>
                                            <p className="font-medium text-foreground">{formatDate(user?.created_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Additional Information Sections for Non-Customer Users */}
            {isNonCustomer && (
                <>
                    {/* Account Status & Security */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-green-500/10">
                                    <Lock className="h-5 w-5 text-green-600" />
                                </div>
                                Account Status & Security
                            </CardTitle>
                            <CardDescription>
                                Security and verification status information
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                {/* Account Status */}
                                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-background">
                                            <Activity className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground mb-0.5">Account Status</p>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                                <p className="font-medium text-foreground">Active</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Email Verification */}
                                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-background">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground mb-0.5">Email Verification</p>
                                            <div className="flex items-center gap-2">
                                                {user?.email_verified_at ? (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                        <p className="font-medium text-foreground">Verified</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock className="h-4 w-4 text-orange-600" />
                                                        <p className="font-medium text-foreground">Pending</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Last Updated */}
                                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-background">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground mb-0.5">Last Updated</p>
                                            <p className="font-medium text-foreground">{formatDate(user?.updated_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Role-Specific Information */}
                    {(user?.type === 'member' || user?.type === 'logistic') && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="p-1.5 rounded-md bg-blue-500/10">
                                        {user?.type === 'member' ? (
                                            <Package className="h-5 w-5 text-blue-600" />
                                        ) : (
                                            <Truck className="h-5 w-5 text-blue-600" />
                                        )}
                                    </div>
                                    {user?.type === 'member' ? 'Member Information' : 'Logistics Information'}
                                </CardTitle>
                                <CardDescription>
                                    {user?.type === 'member' ? 'Member-specific details and information' : 'Logistics-specific details and information'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {/* Member ID or Logistic ID */}
                                    <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                        <div className="flex items-center gap-3">
                                            <div className="p-1.5 rounded-md bg-background">
                                                <Shield className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs text-muted-foreground mb-0.5">
                                                    {user?.type === 'member' ? 'Member ID' : 'Logistic ID'}
                                                </p>
                                                <p className="font-medium text-foreground">
                                                    {user?.member_id || user?.id || 'Not Assigned'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Registration Date */}
                                    {user?.registration_date && (
                                        <div className="p-4 bg-muted/50 rounded-lg border border-border">
                                            <div className="flex items-center gap-3">
                                                <div className="p-1.5 rounded-md bg-background">
                                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs text-muted-foreground mb-0.5">Registration Date</p>
                                                    <p className="font-medium text-foreground">{formatDate(user.registration_date)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Profile Edit Modal */}
            <ProfileEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
            />
        </div>
    );

    // Render with appropriate layout based on user type
    switch (user?.type) {
        case 'admin':
        case 'staff':
            return (
                <AppSidebarLayout>
                    <div className="bg-background">
                        <div className="w-full flex flex-col gap-2 px-2 py-2 sm:px-4 sm:py-4 lg:px-8 pb-8">
                            {/* Page Header */}
                            <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-3 sm:p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2 sm:p-2.5 rounded-lg flex items-center justify-center">
                                        <User className="h-4 w-4 sm:h-6 sm:w-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight m-0">
                                            {t('ui.profile_information')}
                                        </h1>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                                            {t('ui.manage_account_settings')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {profileContent}
                        </div>
                    </div>
                </AppSidebarLayout>
            );
        case 'customer':
            return (
                <AppHeaderLayout>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20">
                        <div className="mb-8">
                            <div className="flex items-start gap-3 sm:gap-4 mb-4">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                        {t('ui.profile_information')}
                                    </h1>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {t('ui.manage_account_settings')}
                                    </p>
                                </div>
                                <Link href="/customer/home">
                                    <Button variant="outline" size="icon" className="sm:w-auto sm:px-4 shrink-0">
                                        <ArrowLeft className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">{t('ui.back')}</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        {profileContent}
                    </div>
                </AppHeaderLayout>
            );
        case 'logistic':
            return (
                <LogisticLayout>
                    <div className="bg-background">
                        <div className="w-full flex flex-col gap-2 px-2 pt-22 py-2 lg:px-8 lg:pt-25 pb-8">
                            {/* Page Header */}
                            <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-3 sm:p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2 sm:p-2.5 rounded-lg flex items-center justify-center shrink-0">
                                        <User className="h-4 w-4 sm:h-6 sm:w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight m-0">
                                            {t('ui.profile_information')}
                                        </h1>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                                            {t('ui.manage_account_settings')}
                                        </p>
                                    </div>
                                    <Link href="/logistic/dashboard">
                                        <Button variant="outline" size="icon" className="sm:w-auto sm:px-4 shrink-0">
                                            <ArrowLeft className="h-4 w-4 sm:mr-2" />
                                            <span className="hidden sm:inline">{t('logistic.back_to_dashboard')}</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            {profileContent}
                        </div>
                    </div>
                </LogisticLayout>
            );
        case 'member':
            return (
                <MemberLayout>
                    <div className="bg-background">
                        <div className="w-full flex flex-col gap-2 px-2 pt-15 py-2 lg:px-8 lg:pt-17 pb-8">
                            {/* Page Header */}
                            <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-3 sm:p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2 sm:p-2.5 rounded-lg flex items-center justify-center shrink-0">
                                        <User className="h-4 w-4 sm:h-6 sm:w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight m-0">
                                            {t('ui.profile_information')}
                                        </h1>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                                            {t('ui.manage_account_settings')}
                                        </p>
                                    </div>
                                    <Link href="/member/dashboard">
                                        <Button variant="outline" size="icon" className="sm:w-auto sm:px-4 shrink-0">
                                            <ArrowLeft className="h-4 w-4 sm:mr-2" />
                                            <span className="hidden sm:inline">{t('member.back_to_dashboard')}</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            {profileContent}
                        </div>
                    </div>
                </MemberLayout>
            );
        default:
            return (
                <AppHeaderLayout>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20">
                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {t('ui.profile_information')}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('ui.manage_account_settings')}
                            </p>
                        </div>
                        {profileContent}
                    </div>
                </AppHeaderLayout>
            );
    }
}
