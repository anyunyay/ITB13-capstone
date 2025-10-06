import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useForm, usePage, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    contact_number?: string;
    avatar?: string;
    avatar_url?: string;
}

interface PageProps {
    user: User;
    newEmail: string;
    requestId: number;
    [key: string]: unknown;
}

export default function EmailChangeConfirmationPage() {
    const { user, newEmail, requestId } = usePage<PageProps>().props;
    const [isProcessing, setIsProcessing] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        request_id: requestId,
    });

    const handleConfirmEmailChange = () => {
        setIsProcessing(true);
        post('/customer/profile/email/confirm-change', {
            onSuccess: (page) => {
                const flash = page.props.flash as any;
                if (flash?.success) {
                    alert(flash.message || 'Email updated successfully!');
                    // Clear any saved state
                    localStorage.removeItem('otpModalState');
                    router.visit('/customer/profile/info');
                }
            },
            onError: () => {
                setIsProcessing(false);
            },
        });
    };

    const handleCancel = () => {
        // Clear any saved state and go back to profile
        localStorage.removeItem('otpModalState');
        router.visit('/customer/profile/info');
    };

    return (
        <AppHeaderLayout breadcrumbs={[
            { title: 'Profile Information', href: '/customer/profile/info' },
            { title: 'Email Verification', href: '/customer/profile/email/verify' },
            { title: 'Confirm Change', href: '#' }
        ]}>
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCancel}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight">Confirm Email Change</h2>
                </div>

                <Card className="max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                            Verification Complete
                        </CardTitle>
                        <CardDescription>
                            Your verification code has been confirmed. Please review the email change below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {errors.error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-2">Current Email:</p>
                                <p className="font-medium">{user.email}</p>
                            </div>
                            
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-2">New Email:</p>
                                <p className="font-medium text-green-600">{newEmail}</p>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium text-yellow-800">Important:</p>
                                    <p className="text-yellow-700">
                                        After changing your email, you'll need to verify your new email address 
                                        to regain full access to your account.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleConfirmEmailChange}
                                disabled={processing || isProcessing}
                                className="flex-1"
                            >
                                {(processing || isProcessing) ? 'Updating Email...' : 'Confirm & Update Email'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={processing || isProcessing}
                            >
                                Cancel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppHeaderLayout>
    );
}
