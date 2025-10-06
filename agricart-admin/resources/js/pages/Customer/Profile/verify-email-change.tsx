import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePage } from '@inertiajs/react';
import { Mail, ArrowLeft, Check, X, RotateCcw } from 'lucide-react';
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

interface EmailChangeRequest {
    id: number;
    new_email: string;
    expires_at: string;
}

interface PageProps {
    user: User;
    emailChangeRequest: EmailChangeRequest;
}

export default function VerifyEmailChangePage() {
    const { user, emailChangeRequest } = usePage<PageProps>().props;
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState('');
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const resendTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate time left until expiration
    useEffect(() => {
        const expiresAt = new Date(emailChangeRequest.expires_at);
        const now = new Date();
        const diff = expiresAt.getTime() - now.getTime();
        
        if (diff > 0) {
            setTimeLeft(Math.floor(diff / 1000));
        }

        // Update time left every second
        timerRef.current = setInterval(() => {
            const now = new Date();
            const diff = expiresAt.getTime() - now.getTime();
            
            if (diff > 0) {
                setTimeLeft(Math.floor(diff / 1000));
            } else {
                setTimeLeft(0);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                }
            }
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [emailChangeRequest.expires_at]);

    // Resend timer
    useEffect(() => {
        if (resendTimer > 0) {
            resendTimerRef.current = setTimeout(() => {
                setResendTimer(prev => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }

        return () => {
            if (resendTimerRef.current) {
                clearTimeout(resendTimerRef.current);
            }
        };
    }, [resendTimer]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        setSuccess('');

        try {
            const response = await fetch(`/customer/profile/email-change/verify/${emailChangeRequest.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    otp: otp,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                // Redirect to profile page
                setTimeout(() => {
                    window.location.href = data.redirect_url;
                }, 2000);
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: data.message || 'Invalid verification code.' });
                }
            }
        } catch (error) {
            setErrors({ general: 'Network error. Please check your connection and try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setIsResending(true);
        setCanResend(false);
        setResendTimer(30);
        setErrors({});

        try {
            const response = await fetch(`/customer/profile/email-change/resend/${emailChangeRequest.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
            } else {
                setErrors({ general: data.message || 'Failed to resend verification code.' });
            }
        } catch (error) {
            setErrors({ general: 'Network error. Please check your connection and try again.' });
        } finally {
            setIsResending(false);
        }
    };

    const handleCancel = async () => {
        if (confirm('Are you sure you want to cancel the email change? This will discard the verification code.')) {
            try {
                const response = await fetch(`/customer/profile/email-change/cancel/${emailChangeRequest.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    },
                });

                const data = await response.json();

                if (data.success) {
                    window.location.href = data.redirect_url;
                } else {
                    setErrors({ general: 'Failed to cancel email change request.' });
                }
            } catch (error) {
                setErrors({ general: 'Network error. Please check your connection and try again.' });
            }
        }
    };

    return (
        <AppHeaderLayout breadcrumbs={[
            { label: 'Profile Information', href: '/customer/profile/info' },
            { label: 'Change Email Address', href: '/customer/profile/email-change' },
            { label: 'Verify Email Change', href: '#' }
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
                    <h2 className="text-3xl font-bold tracking-tight">Verify Email Change</h2>
                </div>

                <Card className="max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5" />
                            Enter Verification Code
                        </CardTitle>
                        <CardDescription>
                            We've sent a 6-digit verification code to <strong>{emailChangeRequest.new_email}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp">Verification Code</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Enter 6-digit code"
                                    maxLength={6}
                                    required
                                    disabled={isLoading}
                                    className="text-center text-lg tracking-widest"
                                />
                                {errors.otp && (
                                    <p className="text-sm text-red-500">{errors.otp}</p>
                                )}
                            </div>

                            {timeLeft > 0 && (
                                <div className="text-center text-sm text-muted-foreground">
                                    Code expires in: <strong>{formatTime(timeLeft)}</strong>
                                </div>
                            )}

                            {timeLeft === 0 && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        Verification code has expired. Please request a new one.
                                    </AlertDescription>
                                </Alert>
                            )}

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

                            <div className="space-y-2">
                                <Button
                                    type="submit"
                                    disabled={isLoading || otp.length !== 6 || timeLeft === 0}
                                    className="w-full flex items-center gap-2"
                                >
                                    <Check className="h-4 w-4" />
                                    {isLoading ? 'Verifying...' : 'Verify Code'}
                                </Button>

                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleResendOtp}
                                        disabled={!canResend || isResending || timeLeft === 0}
                                        className="flex-1 flex items-center gap-2"
                                    >
                                        <RotateCcw className="h-4 w-4" />
                                        {isResending ? 'Sending...' : canResend ? 'Send Code Again' : `Resend in ${resendTimer}s`}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={isLoading}
                                        className="flex-1 flex items-center gap-2"
                                    >
                                        <X className="h-4 w-4" />
                                        Cancel
                                    </Button>
                                </div>
                            </div>
                        </form>

                        <div className="mt-6 p-4 bg-muted rounded-lg">
                            <h4 className="font-medium text-sm mb-2">Didn't receive the code?</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Check your spam/junk folder</li>
                                <li>• Make sure you entered the correct email address</li>
                                <li>• Wait 30 seconds before requesting a new code</li>
                                <li>• Contact support if you continue to have issues</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppHeaderLayout>
    );
}
