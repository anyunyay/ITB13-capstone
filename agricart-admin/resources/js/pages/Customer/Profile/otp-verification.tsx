import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, usePage, router } from '@inertiajs/react';
import { ArrowLeft, Clock, AlertCircle, CheckCircle } from 'lucide-react';
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
    expiresIn: number;
    [key: string]: unknown;
}

export default function OtpVerificationPage() {
    const { user, newEmail, requestId, expiresIn } = usePage<PageProps>().props;
    const [otp, setOtp] = useState('');
    const [timeLeft, setTimeLeft] = useState(expiresIn);
    const [canResend, setCanResend] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { data, setData, post, processing, errors } = useForm({
        request_id: requestId,
        otp: '',
    });

    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Auto-focus on input when page loads
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    // Auto-submit when 6 digits are entered
    useEffect(() => {
        if (otp.length === 6 && !processing && !hasSubmitted) {
            setHasSubmitted(true);
            handleVerify();
        }
    }, [otp, processing, hasSubmitted]);

    // Reset hasSubmitted when there's an error
    useEffect(() => {
        if (errors.error) {
            setHasSubmitted(false);
        }
    }, [errors.error]);

    const handleVerify = () => {
        if (otp.length === 6) {
            setData('otp', otp);
            post('/customer/profile/email/verify-otp', {
                onSuccess: (page) => {
                    const flash = page.props.flash as any;
                    if (flash?.success) {
                        // Redirect to confirmation page
                        router.visit('/customer/profile/email/confirm', {
                            data: { request_id: requestId }
                        });
                    }
                },
                onError: () => {
                    setHasSubmitted(false);
                },
            });
        }
    };

    const handleResend = () => {
        setTimeLeft(expiresIn);
        setCanResend(false);
        setOtp('');
        setHasSubmitted(false);
        
        post('/customer/profile/email/request-change', {
            data: { new_email: newEmail },
            onSuccess: (page) => {
                const flash = page.props.flash as any;
                if (flash?.request_id) {
                    // Update the request ID and reset timer
                    router.reload({
                        data: { request_id: flash.request_id }
                    });
                }
            },
        });
    };

    const handleCancel = () => {
        // Clear any saved state and go back to profile
        localStorage.removeItem('otpModalState');
        router.visit('/customer/profile/info');
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <AppHeaderLayout breadcrumbs={[
            { title: 'Profile Information', href: '/customer/profile/info' },
            { title: 'Email Verification', href: '#' }
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
                    <h2 className="text-3xl font-bold tracking-tight">Email Verification</h2>
                </div>

                <Card className="max-w-md mx-auto">
                    <CardHeader className="text-center">
                        <CardTitle className="flex items-center justify-center gap-2">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                            Verification Code Sent
                        </CardTitle>
                        <CardDescription>
                            We've sent a 6-digit verification code to <strong>{newEmail}</strong>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {errors.error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="otp">Verification Code</Label>
                            <Input
                                ref={inputRef}
                                id="otp"
                                type="text"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="Enter 6-digit code"
                                className="text-center text-lg tracking-widest font-mono"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleVerify();
                                    }
                                }}
                                disabled={processing || hasSubmitted}
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className={timeLeft <= 10 ? 'text-red-500 font-medium' : ''}>
                                    {timeLeft > 0 ? `Code expires in ${formatTime(timeLeft)}` : 'Code expired'}
                                </span>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResend}
                                disabled={!canResend || processing}
                            >
                                {processing ? 'Sending...' : 'Resend Code'}
                            </Button>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={() => {
                                    if (!hasSubmitted) {
                                        setHasSubmitted(true);
                                        handleVerify();
                                    }
                                }}
                                disabled={otp.length !== 6 || processing || hasSubmitted}
                                className="flex-1"
                            >
                                {processing ? 'Verifying...' : hasSubmitted ? 'Verifying...' : 'Verify Code'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            <p>Didn't receive the code? Check your spam folder or try resending.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppHeaderLayout>
    );
}
