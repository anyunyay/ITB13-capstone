import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { AlertCircle, LogOut } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AuthLayout from '@/layouts/auth-layout';

interface SingleSessionRestrictedProps {
    userEmail: string;
    logoutUrl: string;
    cancelUrl: string;
}

export default function SingleSessionRestricted({ userEmail, logoutUrl, cancelUrl }: SingleSessionRestrictedProps) {
    const handleLogout = () => {
        router.post(logoutUrl);
    };

    const handleCancel = () => {
        router.post(cancelUrl);
    };

    return (
        <AuthLayout 
            title="Session Restricted" 
            description="Only one active session is allowed per account"
            imageUrl="/images/frontpage/pexels-pixabay-265216.jpg"
            imagePosition="right"
            icon={<AlertCircle />}
            iconBgColor="bg-destructive/10"
            iconColor="text-destructive"
        >
            <Head title="Session Restricted" />

            <div className="mx-auto max-w-md space-y-6">
                <Alert className="bg-destructive/10 border-destructive/20">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-foreground">
                        Your account ({userEmail}) is currently logged in from another device or browser. 
                        For security reasons, only one active session is allowed at a time. You can end the other session to login here.
                    </AlertDescription>
                </Alert>

                <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-card-foreground">
                        To access your account from this device, you need to:
                    </h3>
                    
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground ml-2">
                        <li>Log out from the other device/browser, or</li>
                        <li>Wait for the other session to expire, or</li>
                        <li>Use the button below to end the other session and login here</li>
                    </ol>
                </div>

                <div className="flex flex-col space-y-3">
                    <Button 
                        onClick={handleLogout}
                        className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                        <LogOut className="h-4 w-4 mr-2" />
                        End Other Session & Login Here
                    </Button>
                    
                    <Button 
                        variant="outline" 
                        onClick={handleCancel}
                        className="w-full"
                    >
                        Cancel & Keep Other Session
                    </Button>
                </div>

                <div className="text-center">
                    <p className="text-xs text-muted-foreground">
                        This security feature helps protect your account from unauthorized access.
                    </p>
                </div>
            </div>
        </AuthLayout>
    );
}
