import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm, usePage } from '@inertiajs/react';
import { LogOut, AlertTriangle, CheckCircle } from 'lucide-react';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import LogisticLayout from '@/layouts/logistic-layout';
import MemberLayout from '@/layouts/member-layout';
import { clearSessionData } from '@/lib/csrf-cleanup';
import { useTranslation } from '@/hooks/use-translation';
import { getProfileRoutes } from '@/lib/utils';

interface PageProps {
    user: {
        id: number;
        name: string;
        email: string;
        type: string;
    };
    [key: string]: any;
}

export default function LogoutPage() {
    const { user } = usePage<PageProps>().props;
    const t = useTranslation();
    
    // Generate dynamic routes based on user type
    const profileRoutes = getProfileRoutes(user.type);
    const routes = {
        logout: profileRoutes.logout,
        logoutAll: `${profileRoutes.logout}-all`,
        logoutPage: profileRoutes.logoutPage,
    };

    const { post: logout, processing: logoutProcessing } = useForm();
    const { post: logoutAll, processing: logoutAllProcessing } = useForm();

    const handleLogout = () => {
        if (confirm(t('ui.confirm_logout'))) {
            // Clear all session data including CSRF tokens before logout
            clearSessionData();
            
            logout(routes.logout, {
                onSuccess: () => {
                    alert(t('ui.logout_success'));
                },
                onError: () => {
                    alert(t('ui.logout_failed'));
                },
            });
        }
    };

    const handleLogoutAllDevices = () => {
        if (confirm(t('ui.confirm_logout_all_devices'))) {
            // Clear all session data including CSRF tokens before logout
            clearSessionData();
            
            logoutAll(routes.logoutAll, {
                onSuccess: () => {
                    alert(t('ui.logout_all_success'));
                },
                onError: () => {
                    alert(t('ui.logout_all_failed'));
                },
            });
        }
    };

    const pageContent = user.type === 'customer' ? (
        // Customer Design - Clean & Modern
        <Card className="border-2 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-destructive/5 via-destructive/10 to-destructive/5 pb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-destructive/10 rounded-2xl">
                            <LogOut className="h-7 w-7 text-destructive" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">{t('ui.account_security')}</CardTitle>
                            <CardDescription className="text-base mt-1">
                                {t('ui.manage_session_security')}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <Alert className="border-2 bg-primary/5">
                        <CheckCircle className="h-5 w-5" />
                        <AlertDescription className="text-base">
                            {t('ui.currently_logged_in_as')} <strong>{user?.name}</strong> ({user?.email})
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-6">
                        <div className="p-6 border-2 rounded-2xl bg-card">
                            <h3 className="font-bold text-lg mb-3 text-card-foreground">{t('ui.logout_from_this_device')}</h3>
                            <p className="text-base text-muted-foreground mb-6">
                                {t('ui.logout_this_device_desc')}
                            </p>
                            <Button 
                                onClick={handleLogout} 
                                disabled={logoutProcessing}
                                className="h-12 px-6 text-base rounded-xl"
                            >
                                <LogOut className="h-5 w-5 mr-2" />
                                {logoutProcessing ? t('ui.logging_out') : t('ui.logout')}
                            </Button>
                        </div>

                        <div className="p-6 border-2 border-orange-300 bg-orange-50 dark:bg-orange-950/20 rounded-2xl">
                            <h3 className="font-bold text-lg mb-3 flex items-center gap-3 text-orange-800 dark:text-orange-200">
                                <AlertTriangle className="h-6 w-6 text-orange-600" />
                                {t('ui.logout_from_all_devices')}
                            </h3>
                            <p className="text-base text-muted-foreground mb-6">
                                {t('ui.logout_all_devices_desc')}
                            </p>
                            <Button 
                                onClick={handleLogoutAllDevices} 
                                disabled={logoutAllProcessing}
                                variant="destructive"
                                className="h-12 px-6 text-base rounded-xl"
                            >
                                <LogOut className="h-5 w-5 mr-2" />
                                {logoutAllProcessing ? t('ui.logging_out') : t('ui.logout_from_all_devices_btn')}
                            </Button>
                        </div>
                    </div>

                    <div className="pt-6 border-t-2 border-border">
                        <h3 className="font-bold text-lg mb-4 text-card-foreground">{t('ui.security_tips')}</h3>
                        <ul className="text-base text-muted-foreground space-y-2">
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>{t('ui.always_logout_shared_computers')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>{t('ui.use_strong_passwords')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>{t('ui.enable_two_factor')}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-primary mt-1">•</span>
                                <span>{t('ui.review_account_activity')}</span>
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
    ) : (
        // Admin/Staff/Logistic/Member Design - Professional & Compact
        <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <LogOut className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <CardTitle className="text-green-600 dark:text-green-400">
                                {t('ui.account_security')}
                            </CardTitle>
                            <CardDescription>
                                {t('ui.manage_session_security')}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert className="border bg-primary/5">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                            {t('ui.currently_logged_in_as')} <strong>{user?.name}</strong> ({user?.email})
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                        <div className="p-4 border rounded-lg bg-card">
                            <h3 className="font-semibold mb-2 text-card-foreground">{t('ui.logout_from_this_device')}</h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                {t('ui.logout_this_device_desc')}
                            </p>
                            <Button 
                                onClick={handleLogout} 
                                disabled={logoutProcessing}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                {logoutProcessing ? t('ui.logging_out') : t('ui.logout')}
                            </Button>
                        </div>

                        <div className="p-4 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-orange-800 dark:text-orange-200">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                {t('ui.logout_from_all_devices')}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                                {t('ui.logout_all_devices_desc')}
                            </p>
                            <Button 
                                onClick={handleLogoutAllDevices} 
                                disabled={logoutAllProcessing}
                                variant="destructive"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                {logoutAllProcessing ? t('ui.logging_out') : t('ui.logout_from_all_devices_btn')}
                            </Button>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="font-semibold mb-2 text-card-foreground text-sm">{t('ui.security_tips')}</h3>
                        <ul className="text-xs text-muted-foreground space-y-1">
                            <li>• {t('ui.always_logout_shared_computers')}</li>
                            <li>• {t('ui.use_strong_passwords')}</li>
                            <li>• {t('ui.enable_two_factor')}</li>
                            <li>• {t('ui.review_account_activity')}</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
    );

    // Render with appropriate layout based on user type
    switch (user?.type) {
        case 'admin':
        case 'staff':
            return (
                <AppSidebarLayout>
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {t('ui.logout')}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('ui.manage_session_security')}
                            </p>
                        </div>
                        {pageContent}
                    </div>
                </AppSidebarLayout>
            );
        case 'customer':
            return (
                <AppHeaderLayout>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20">
                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {t('ui.logout')}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('ui.manage_session_security')}
                            </p>
                        </div>
                        {pageContent}
                    </div>
                </AppHeaderLayout>
            );
        case 'logistic':
            return (
                <LogisticLayout>
                    <div className="px-2 pt-22 py-2 lg:px-8 lg:pt-25">
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {t('ui.logout')}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('ui.manage_session_security')}
                            </p>
                        </div>
                        {pageContent}
                    </div>
                </LogisticLayout>
            );
        case 'member':
            return (
                <MemberLayout>
                    <div className="px-2 pt-15 py-2 lg:px-8 lg:pt-17">
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {t('ui.logout')}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('ui.manage_session_security')}
                            </p>
                        </div>
                        {pageContent}
                    </div>
                </MemberLayout>
            );
        default:
            return (
                <AppHeaderLayout>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20">
                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {t('ui.logout')}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('ui.manage_session_security')}
                            </p>
                        </div>
                        {pageContent}
                    </div>
                </AppHeaderLayout>
            );
    }
}
