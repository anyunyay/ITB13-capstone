import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePage, router } from '@inertiajs/react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import EmailChangeOtpModal from '@/components/EmailChangeOtpModal';

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
    [key: string]: unknown;
}

export default function ChangeEmailPage() {
    const { user } = usePage<PageProps>().props;
    const [newEmail, setNewEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState('');
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpData, setOtpData] = useState<{
        requestId: number;
        newEmail: string;
        currentEmail: string;
    } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        setSuccess('');

        try {
            const response = await fetch('/customer/profile/email-change/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    new_email: newEmail,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setOtpData({
                    requestId: data.requestId,
                    newEmail: data.newEmail,
                    currentEmail: data.currentEmail,
                });
                setShowOtpModal(true);
                setSuccess(data.message);
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: data.message || 'Failed to send verification code.' });
                }
            }
        } catch (error) {
            setErrors({ general: 'Network error. Please check your connection and try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSuccess = () => {
        // Redirect to profile page after successful email change
        router.visit('/customer/profile/info');
    };

    const handleOtpModalClose = () => {
        setShowOtpModal(false);
        setOtpData(null);
        setSuccess('');
    };

    return (
        <AppHeaderLayout breadcrumbs={[
            { title: 'Profile Information', href: '/customer/profile/info' },
            { title: 'Change Email Address', href: '/customer/profile/email-change' }
        ]}>
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.history.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight">Change Email Address</h2>
                </div>

                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Update Email Address
                        </CardTitle>
                        <CardDescription>
                            Enter your new email address. We'll send you a verification code to your current email address to confirm the change.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-email">Current Email</Label>
                                <Input
                                    id="current-email"
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new-email">New Email Address</Label>
                                <Input
                                    id="new-email"
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="Enter your new email address"
                                    required
                                    disabled={isLoading}
                                />
                                {errors.new_email && (
                                    <p className="text-sm text-red-500">{errors.new_email}</p>
                                )}
                            </div>

                            {errors.general && (
                                <Alert variant="destructive">
                                    <AlertDescription>{errors.general}</AlertDescription>
                                </Alert>
                            )}

                            {success && (
                                <Alert>
                                    <AlertDescription>{success}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading || !newEmail.trim()}
                                className="w-full flex items-center gap-2"
                            >
                                <Send className="h-4 w-4" />
                                {isLoading ? 'Sending...' : 'Send Verification Code'}
                            </Button>
                        </form>

                        <div className="mt-6 p-4 bg-muted rounded-lg">
                            <h4 className="font-medium text-sm mb-2">Important Notes:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• The verification code will be sent to your current email address</li>
                                <li>• The verification code will expire in 15 minutes</li>
                                <li>• Make sure you have access to your current email address</li>
                                <li>• Your email will be updated immediately after verification</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* OTP Modal */}
            {otpData && (
                <EmailChangeOtpModal
                    isOpen={showOtpModal}
                    onClose={handleOtpModalClose}
                    onSuccess={handleOtpSuccess}
                    requestId={otpData.requestId}
                    newEmail={otpData.newEmail}
                    currentEmail={otpData.currentEmail}
                    allowClose={false}
                />
            )}
        </AppHeaderLayout>
    );
}
