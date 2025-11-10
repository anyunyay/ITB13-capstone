import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePage } from '@inertiajs/react';
import { User, Edit, Mail, Phone, Calendar, Shield, MapPin, FileText, Settings, Key, Palette, HelpCircle, LogOut, Database } from 'lucide-react';
import ProfileWrapper from './profile-wrapper';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProfileEditModal from '@/components/shared/profile/ProfileEditModal';
import { getDisplayEmail, getProfileRoutes, hasFeatureAccess } from '@/lib/utils';
import { router } from '@inertiajs/react';
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

    // Generate dynamic routes based on user type
    const routes = getProfileRoutes(user?.type || 'customer');

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

    return (
        <ProfileWrapper 
            title={t('ui.profile_information')}
        >
            <div className="space-y-6">
                {/* Main Profile Header */}
                <Card className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group">
                    <CardHeader className="bg-gradient-to-r from-muted/80 to-muted/60 backdrop-blur-sm border-b border-border/50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 sm:pt-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                                <div className="relative">
                                    <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-card/50 shadow-2xl ring-4 ring-border/50 transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-primary/20">
                                        <AvatarImage 
                                            src={user?.avatar_url || undefined} 
                                            alt={user?.name} 
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="text-xl sm:text-2xl bg-gradient-to-br from-muted to-muted/60 text-card-foreground font-bold">
                                            {user?.name ? getInitials(user.name) : 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full border-4 border-card shadow-lg flex items-center justify-center">
                                        <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-primary-foreground" />
                                    </div>
                                </div>
                                <div className="space-y-1 text-center sm:text-left">
                                    <h1 className="text-xl sm:text-2xl font-bold text-card-foreground">
                                        {user?.name || 'No Name'}
                                    </h1>
                                    <div className="flex items-center justify-center sm:justify-start gap-2">
                                        <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-secondary/10 text-secondary">
                                            <User className="h-3 w-3 mr-1" />
                                            {getUserTypeLabel(user?.type || '')}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-muted-foreground">
                                        {t('ui.member_since')} {formatDate(user?.created_at)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                                <Button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                                >
                                    <Edit className="h-4 w-4" />
                                    {t('ui.edit_profile')}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                            {/* Contact Information */}
                            <div className="space-y-4 sm:space-y-6">
                                <h3 className="text-lg sm:text-xl font-semibold text-card-foreground flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-secondary/10">
                                        <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-secondary" />
                                    </div>
                                    {t('ui.contact_information')}
                                </h3>
                                <div className="space-y-4">
                                    {user?.type !== 'member' && (
                                        <div className="p-5 bg-muted/80 rounded-xl border border-border/50 hover:bg-muted/60 transition-colors duration-200">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 rounded-lg bg-muted">
                                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-muted-foreground mb-1">{t('ui.email')} {t('ui.address')}</p>
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
                                                <p className="text-sm text-muted-foreground mb-1">{t('ui.phone')} Number</p>
                                                <p className="font-medium text-card-foreground text-lg">{displayPhone || t('ui.not_provided')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="space-y-4 sm:space-y-6">
                                <h3 className="text-lg sm:text-xl font-semibold text-card-foreground flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                    </div>
                                    {t('ui.account_information')}
                                </h3>
                                <div className="space-y-4">
                                    {/* Current Address */}
                                    <div className="p-5 bg-muted/80 rounded-xl border border-border/50 hover:bg-muted/60 transition-colors duration-200">
                                        <div className="flex items-start gap-4">
                                            <div className="p-2 rounded-lg bg-muted mt-0.5 flex-shrink-0">
                                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm text-muted-foreground mb-2">{t('ui.current_address')}</p>
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
                                                <p className="text-sm text-muted-foreground mb-1">{t('ui.account_created')}</p>
                                                <p className="font-medium text-card-foreground text-lg">{formatDate(user?.created_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Role-based Navigation Links */}
                {user?.type && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Settings className="h-5 w-5 text-primary" />
                                </div>
                                {user.type === 'admin' || user.type === 'staff' ? t('ui.admin_tools') :
                                 user.type === 'customer' ? t('ui.account_tools') :
                                 user.type === 'logistic' ? t('ui.logistics_tools') :
                                 user.type === 'member' ? t('ui.member_tools') : t('ui.profile_tools')}
                            </CardTitle>
                            <CardDescription>
                                {user.type === 'admin' || user.type === 'staff' ? t('ui.access_admin_features') :
                                 user.type === 'customer' ? t('ui.manage_account_settings') :
                                 user.type === 'logistic' ? t('ui.access_logistics_features') :
                                 user.type === 'member' ? t('ui.access_member_features') : t('ui.manage_profile_settings')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                                {/* System Logs - Admin/Staff only */}
                                {hasFeatureAccess(user.type, 'system_logs') && routes.systemLogs && (
                                    <Button
                                        variant="outline"
                                        className="h-auto p-3 sm:p-4 flex flex-col items-start gap-2 sm:gap-3 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
                                        onClick={() => router.visit(routes.systemLogs!)}
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <Database className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                                            <span className="text-sm sm:text-base font-medium">{t('ui.system_logs')}</span>
                                        </div>
                                        <p className="text-xs sm:text-sm text-muted-foreground text-left">
                                            {t('ui.view_analyze_system_logs')}
                                        </p>
                                    </Button>
                                )}

                                {/* Address Management - Customer only */}
                                {hasFeatureAccess(user.type, 'address_management') && (
                                    <Button
                                        variant="outline"
                                        className="h-auto p-4 flex flex-col items-start gap-3 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
                                        onClick={() => router.visit(routes.addresses)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            <span className="font-medium">{t('ui.address_management')}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground text-left">
                                            {t('ui.manage_delivery_addresses')}
                                        </p>
                                    </Button>
                                )}

                                {/* Password Change - All users */}
                                {hasFeatureAccess(user.type, 'password_change') && (
                                    <Button
                                        variant="outline"
                                        className="h-auto p-4 flex flex-col items-start gap-3 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
                                        onClick={() => router.visit(routes.password)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Key className="h-5 w-5 text-primary" />
                                            <span className="font-medium">{t('ui.change_password')}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground text-left">
                                            {t('ui.update_password_security')}
                                        </p>
                                    </Button>
                                )}

                                {/* Appearance Settings - All users */}
                                {hasFeatureAccess(user.type, 'appearance_settings') && (
                                    <Button
                                        variant="outline"
                                        className="h-auto p-4 flex flex-col items-start gap-3 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
                                        onClick={() => router.visit(routes.appearance)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Palette className="h-5 w-5 text-primary" />
                                            <span className="font-medium">{t('ui.appearance')}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground text-left">
                                            {t('ui.customize_interface_theme')}
                                        </p>
                                    </Button>
                                )}

                                {/* Help & Support - All users */}
                                {hasFeatureAccess(user.type, 'help_center') && (
                                    <Button
                                        variant="outline"
                                        className="h-auto p-4 flex flex-col items-start gap-3 hover:bg-primary/5 hover:border-primary/20 transition-all duration-200"
                                        onClick={() => router.visit(routes.help)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <HelpCircle className="h-5 w-5 text-primary" />
                                            <span className="font-medium">{t('ui.help_and_support')}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground text-left">
                                            {t('ui.get_help_documentation')}
                                        </p>
                                    </Button>
                                )}

                                {/* Logout - All users */}
                                {hasFeatureAccess(user.type, 'logout') && (
                                    <Button
                                        variant="outline"
                                        className="h-auto p-4 flex flex-col items-start gap-3 hover:bg-destructive/5 hover:border-destructive/20 transition-all duration-200"
                                        onClick={() => router.visit(routes.logoutPage)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <LogOut className="h-5 w-5 text-destructive" />
                                            <span className="font-medium">{t('ui.logout')}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground text-left">
                                            {t('ui.sign_out_securely')}
                                        </p>
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
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
