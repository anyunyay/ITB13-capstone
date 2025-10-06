import { useState, useEffect, useRef, useCallback } from 'react';
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
    const [resendCooldown, setResendCooldown] = useState(30); // 30-second resend cooldown
    const [canResend, setCanResend] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle success messages from backend redirection
    useEffect(() => {
        const flash = (window as any).page?.props?.flash;
        if (flash?.success && flash?.message) {
            console.log('Success message from backend:', flash.message);
            // You can show a toast notification here if needed
        }
    }, []);

    // Restore state from localStorage on page load
    useEffect(() => {
        const savedState = localStorage.getItem('emailChangeState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                // Check if the state is not too old (max 30 minutes)
                if (Date.now() - state.timestamp < 30 * 60 * 1000) {
                    console.log('Restored email change state from localStorage:', state);
                    
                    // Restore expiration time if available
                    if (state.expiresIn) {
                        setTimeLeft(state.expiresIn);
                    }
                } else {
                    // Clear old state
                    localStorage.removeItem('emailChangeState');
                }
            } catch (e) {
                console.error('Failed to parse saved email change state:', e);
                localStorage.removeItem('emailChangeState');
            }
        }
    }, []);

    const { data, setData, post, processing, errors } = useForm({
        request_id: requestId,
        otp: '',
    });

    // Timer effect for OTP expiration
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Resend cooldown timer
    useEffect(() => {
        const cooldownTimer = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(cooldownTimer);
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

    const handleVerify = useCallback(() => {
        if (otp.length === 6) {
            // Get the current request ID from localStorage (might be updated by resend)
            const savedState = localStorage.getItem('emailChangeState');
            let currentRequestId = requestId;
            
            if (savedState) {
                try {
                    const state = JSON.parse(savedState);
                    if (state.requestId) {
                        currentRequestId = state.requestId;
                    }
                } catch (e) {
                    console.error('Failed to parse saved state:', e);
                }
            }
            
            setData('otp', otp);
            setData('request_id', currentRequestId);
            
            post('/customer/profile/email/verify-otp', {
                onSuccess: (page) => {
                    const flash = page.props.flash as any;
                    if (flash?.success) {
                        // Redirect to confirmation page
                        router.visit('/customer/profile/email/confirm', {
                            data: { request_id: currentRequestId }
                        });
                    }
                },
                onError: () => {
                    setHasSubmitted(false);
                },
            });
        }
    }, [otp, setData, post, requestId]);

    const handleResend = useCallback(() => {
        setIsResending(true);
        setOtp('');
        setHasSubmitted(false);
        setCanResend(false);
        setResendCooldown(30); // Reset 30-second cooldown
        
        post('/customer/profile/email/request-change', {
            data: { new_email: newEmail },
            onSuccess: (page) => {
                setIsResending(false);
                const flash = page.props.flash as any;
                if (flash?.request_id) {
                    // Update localStorage with new request ID
                    localStorage.setItem('emailChangeState', JSON.stringify({
                        newEmail,
                        requestId: flash.request_id,
                        expiresAt: flash.expires_at,
                        expiresIn: flash.expires_in,
                        timestamp: Date.now()
                    }));
                    
                    // Reset OTP expiration timer with new expiration time
                    if (flash.expires_in) {
                        setTimeLeft(flash.expires_in);
                    } else {
                        setTimeLeft(900); // 15 minutes fallback
                    }
                    
                    console.log('New OTP sent successfully, new request ID:', flash.request_id);
                    console.log('OTP expires in:', flash.expires_in || '15 minutes');
                    console.log('Backend will redirect to OTP verification page');
                } else {
                    console.error('No request_id in resend response');
                    setCanResend(true);
                }
            },
            onError: (errors) => {
                setIsResending(false);
                setCanResend(true);
                console.error('Resend failed:', errors);
            },
        });
    }, [newEmail, post]);

    const handleCancel = () => {
        // Clear saved state and go back to profile
        localStorage.removeItem('emailChangeState');
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

                        {/* Success message from backend redirection */}
                        {usePage().props.flash?.success && (
                            <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {usePage().props.flash.message || 'OTP sent successfully!'}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Warning message from backend redirection */}
                        {usePage().props.flash?.warning && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    {usePage().props.flash.message || 'Please verify the existing OTP.'}
                                </AlertDescription>
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
                                autoComplete="one-time-code"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleVerify();
                                    }
                                }}
                                disabled={processing || hasSubmitted || isResending}
                            />
                            {errors.otp && (
                                <p className="text-sm text-red-500">{errors.otp}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span className={timeLeft <= 60 ? 'text-red-500 font-medium' : ''}>
                                    {timeLeft > 0 ? `OTP expires in ${formatTime(timeLeft)}` : 'OTP expired'}
                                </span>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleResend}
                                disabled={!canResend || processing || isResending}
                            >
                                {isResending ? 'Sending...' : 
                                 !canResend ? `Resend in ${resendCooldown}s` : 
                                 'Send Code Again'}
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
                                disabled={otp.length !== 6 || processing || hasSubmitted || isResending}
                                className="flex-1"
                            >
                                {processing ? 'Verifying...' : hasSubmitted ? 'Verifying...' : 'Verify Code'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={processing || isResending}
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
