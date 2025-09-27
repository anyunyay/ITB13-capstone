import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, LogOut } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SingleSessionRestrictedProps {
    userEmail: string;
    logoutUrl: string;
}

export default function SingleSessionRestricted({ userEmail, logoutUrl }: SingleSessionRestrictedProps) {
    const handleLogout = () => {
        router.post(logoutUrl);
    };

    const handleGoBack = () => {
        router.get('/');
    };

    return (
        <>
            <Head title="Session Restricted" />
            
            <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 mb-4">
                                <AlertCircle className="h-6 w-6 text-red-400" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-white">
                                Session Restricted
                            </CardTitle>
                            <CardDescription className="text-gray-300">
                                Only one active session is allowed per account
                            </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                            <Alert className="bg-red-900/20 border-red-800">
                                <AlertCircle className="h-4 w-4 text-red-400" />
                                <AlertDescription className="text-red-200">
                                    Your account ({userEmail}) is currently logged in from another device or browser. 
                                    For security reasons, only one active session is allowed at a time. You can end the other session to login here.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-4">
                                <p className="text-sm text-gray-300">
                                    To access your account from this device, you need to:
                                </p>
                                
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                                    <li>Log out from the other device/browser, or</li>
                                    <li>Wait for the other session to expire, or</li>
                                    <li>Use the button below to end the other session and login here</li>
                                </ol>
                            </div>

                            <div className="flex flex-col space-y-3">
                                <Button 
                                    onClick={handleLogout}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    End Other Session & Login Here
                                </Button>
                                
                                <Button 
                                    variant="outline" 
                                    onClick={handleGoBack}
                                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                                >
                                    Go Back
                                </Button>
                            </div>

                            <div className="text-center">
                                <p className="text-xs text-gray-400">
                                    This security feature helps protect your account from unauthorized access.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
