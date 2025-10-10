import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useForm, usePage } from '@inertiajs/react';
import { LogOut, AlertTriangle, CheckCircle } from 'lucide-react';
import ProfileWrapper from './profile-wrapper';

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
    
    // Generate dynamic routes based on user type
    const getProfileRoutes = () => {
        const userType = user.type;
        const baseRoute = userType === 'customer' ? '/customer' : 
                         userType === 'admin' || userType === 'staff' ? '/admin' :
                         userType === 'logistic' ? '/logistic' :
                         userType === 'member' ? '/member' : '/customer';
        
        return {
            logout: `${baseRoute}/profile/logout`,
            logoutAll: `${baseRoute}/profile/logout-all`,
            logoutPage: `${baseRoute}/profile/logout`,
        };
    };

    const routes = getProfileRoutes();

    const { post: logout, processing: logoutProcessing } = useForm();
    const { post: logoutAll, processing: logoutAllProcessing } = useForm();

    const handleLogout = () => {
        if (confirm('Are you sure you want to log out?')) {
            logout(routes.logout, {
                onSuccess: () => {
                    alert('You have been logged out successfully.');
                },
                onError: () => {
                    alert('Failed to log out. Please try again.');
                },
            });
        }
    };

    const handleLogoutAllDevices = () => {
        if (confirm('This will log you out from all devices. Are you sure you want to continue?')) {
            logoutAll(routes.logoutAll, {
                onSuccess: () => {
                    alert('You have been logged out from all devices.');
                },
                onError: () => {
                    alert('Failed to log out from all devices. Please try again.');
                },
            });
        }
    };

    return (
        <ProfileWrapper 
            breadcrumbs={[
                { title: 'Logout', href: routes.logoutPage }
            ]}
            title="Logout"
        >

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <LogOut className="h-5 w-5" />
                        Account Security
                    </CardTitle>
                    <CardDescription>
                        Manage your account session and security settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            You are currently logged in as <strong>{user?.name}</strong> ({user?.email})
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-4">
                        <div className="p-4 border rounded-lg">
                            <h3 className="font-semibold mb-2">Logout from this device</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                This will log you out from this browser/device only. You'll remain logged in on other devices.
                            </p>
                            <Button 
                                onClick={handleLogout} 
                                disabled={logoutProcessing}
                                className="flex items-center gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                {logoutProcessing ? 'Logging out...' : 'Logout'}
                            </Button>
                        </div>

                        <div className="p-4 border rounded-lg border-orange-200 bg-orange-50">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4 text-orange-600" />
                                Logout from all devices
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                This will log you out from all devices and browsers. You'll need to log in again on any device you want to use.
                            </p>
                            <Button 
                                onClick={handleLogoutAllDevices} 
                                disabled={logoutAllProcessing}
                                variant="destructive"
                                className="flex items-center gap-2"
                            >
                                <LogOut className="h-4 w-4" />
                                {logoutAllProcessing ? 'Logging out...' : 'Logout from All Devices'}
                            </Button>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <h3 className="font-semibold mb-2">Security Tips</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Always log out when using shared or public computers</li>
                            <li>• Use strong, unique passwords for your account</li>
                            <li>• Enable two-factor authentication if available</li>
                            <li>• Regularly review your account activity</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </ProfileWrapper>
    );
}
