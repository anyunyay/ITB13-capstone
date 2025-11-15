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

    const pageContent = (
        <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                        <LogOut className="h-5 w-5" />
                        {t('ui.account_security')}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        {t('ui.manage_session_security')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            {t('ui.currently_logged_in_as')} <strong>{user?.name}</strong> ({user?.email})
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        <div className="p-4 border border-border rounded-lg bg-card">
                            <h3 className="font-semibold mb-2 text-card-foreground">{t('ui.logout_from_this_device')}</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {t('ui.logout_this_device_desc')}
                            </p>
                            <Button 
                                onClick={handleLogout} 
                                disabled={logoutProcessing}
                                className="flex items-center gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                {logoutProcessing ? t('ui.logging_out') : t('ui.logout')}
                            </Button>
                        </div>

                        <div className="p-4 border border-orange-200 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                            <h3 className="font-semibold mb-2 flex items-center gap-2 text-orange-800 dark:text-orange-200">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                {t('ui.logout_from_all_devices')}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {t('ui.logout_all_devices_desc')}
                            </p>
                            <Button 
                                onClick={handleLogoutAllDevices} 
                                disabled={logoutAllProcessing}
                                variant="destructive"
                                className="flex items-center gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                {logoutAllProcessing ? t('ui.logging_out') : t('ui.logout_from_all_devices_btn')}
                            </Button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                        <h3 className="font-semibold mb-2 text-card-foreground">{t('ui.security_tips')}</h3>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>{t('ui.always_logout_shared_computers')}</li>
                            <li>{t('ui.use_strong_passwords')}</li>
                            <li>{t('ui.enable_two_factor')}</li>
                            <li>{t('ui.review_account_activity')}</li>
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
                </LogisticLayout>
            );
        case 'member':
            return (
                <MemberLayout>
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
