import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router, usePage, useForm } from '@inertiajs/react';
import { Mail, Send, Check, X, RotateCcw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getCsrfTokenFromMeta, refreshCsrfToken } from '@/lib/csrf-cleanup';

interface User {
    id: number;
    name: string;
    email: string;
    type: string;
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

interface EmailChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    emailChangeRequest?: EmailChangeRequest;
}

// Utility function to mask email addresses for security
const maskEmail = (email: string): string => {
    if (!email || !email.includes('@')) return email;
    
    const [localPart, domain] = email.split('@');
    
    if (localPart.length <= 2) {
        return `${localPart[0]}***@${domain}`;
    } else if (localPart.length <= 5) {
        return `${localPart[0]}***@${domain}`;
    } else {
        return `${localPart[0]}${localPart[1]}***@${domain}`;
    }
};

export default function EmailChangeModal({ isOpen, onClose, user, emailChangeRequest }: EmailChangeModalProps) {
    const [step, setStep] = useState<'email' | 'verify'>('email');
    const [otp, setOtp] = useState('');
    const [success, setSuccess] = useState('');
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentEmailChangeRequest, setCurrentEmailChangeRequest] = useState<EmailChangeRequest | null>(null);
    const [showBackConfirmation, setShowBackConfirmation] = useState(false);
    
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const resendTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Use Inertia forms for CSRF handling
    const { data: emailData, setData: setEmailData, processing: emailProcessing, errors: emailErrors, reset: resetEmail } = useForm({
        new_email: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Get the appropriate API endpoint based on user type
    const getApiEndpoint = (action: string, requestId?: string) => {
        // Determine the user type prefix based on user type
        const userType = user.type;
        let userTypePrefix = '';
        
        if (userType === 'admin' || userType === 'staff') {
            userTypePrefix = '/admin';
        } else if (userType === 'customer') {
            userTypePrefix = '/customer';
        } else if (userType === 'logistic') {
            userTypePrefix = '/logistic';
        } else if (userType === 'member') {
            userTypePrefix = '/member';
        } else {
            userTypePrefix = '/customer'; // fallback
        }
        
        const baseUrl = `${userTypePrefix}/profile/email-change`;
        switch (action) {
            case 'send-otp':
                return `${baseUrl}/send-otp`;
            case 'verify':
                return `${baseUrl}/verify/${requestId}`;
            case 'resend':
                return `${baseUrl}/resend/${requestId}`;
            case 'cancel':
                return `${baseUrl}/cancel/${requestId}`;
            default:
                return baseUrl;
        }
    };

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep('email');
            setEmailData('new_email', '');
            setOtp('');
            setSuccess('');
            setResendTimer(30);
            setCanResend(false);
            setIsResending(false);
            setTimeLeft(0);
            setCurrentEmailChangeRequest(null);
            setShowBackConfirmation(false);
            resetEmail();
        }
    }, [isOpen]);

    // Calculate time left until expiration
    useEffect(() => {
        const request = currentEmailChangeRequest || emailChangeRequest;
        if (request && step === 'verify') {
            const expiresAt = new Date(request.expires_at);
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
        }
    }, [currentEmailChangeRequest, emailChangeRequest, step]);

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

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        setSuccess('');

        const url = getApiEndpoint('send-otp');

        try {
            const csrfToken = getCsrfTokenFromMeta();
            
            if (!csrfToken) {
                throw new Error('CSRF token not found in meta tag');
            }
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    new_email: emailData.new_email,
                }),
            });


            if (!response.ok) {
                const errorText = await response.text();
                console.error('Email submit error response:', errorText);
                
                // If CSRF token mismatch, try to refresh token and retry once
                if (response.status === 419) {
                    console.log('CSRF token mismatch detected, attempting to refresh token...');
                    const newToken = await refreshCsrfToken();
                    if (newToken) {
                        console.log('New CSRF token obtained, retrying request...');
                        // Update the meta tag with the new token
                        const metaTag = document.querySelector('meta[name="csrf-token"]');
                        if (metaTag) {
                            metaTag.setAttribute('content', newToken);
                        }
                        
                        // Retry the request with the new token
                        const retryResponse = await fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': newToken,
                                'X-Requested-With': 'XMLHttpRequest',
                                'Accept': 'application/json',
                            },
                            body: JSON.stringify({
                                new_email: emailData.new_email,
                            }),
                        });
                        
                        if (retryResponse.ok) {
                            const retryData = await retryResponse.json();
                            
                            if (retryData.success) {
                                setSuccess(retryData.message || 'Verification code sent successfully!');
                                if (retryData.emailChangeRequest) {
                                    setCurrentEmailChangeRequest(retryData.emailChangeRequest);
                                }
                                setStep('verify');
                            } else {
                                if (retryData.errors) {
                                    setErrors(retryData.errors);
                                } else {
                                    setErrors({ general: retryData.message || 'Failed to send verification code.' });
                                }
                            }
                            return; // Exit early on successful retry
                        }
                    }
                }
                
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message || 'Verification code sent successfully!');
                if (data.emailChangeRequest) {
                    setCurrentEmailChangeRequest(data.emailChangeRequest);
                }
                setStep('verify');
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: data.message || 'Failed to send verification code.' });
                }
            }
        } catch (error) {
            console.error('Email submit error:', error);
            setErrors({ general: 'Network error. Please check your connection and try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        setSuccess('');

        const request = currentEmailChangeRequest || emailChangeRequest;
        if (!request) {
            setErrors({ general: 'Invalid verification request.' });
            setIsLoading(false);
            return;
        }

        try {
            const csrfToken = getCsrfTokenFromMeta();
            
            if (!csrfToken) {
                throw new Error('CSRF token not found in meta tag');
            }
            
            const verifyUrl = getApiEndpoint('verify', request.id.toString());
            
            const response = await fetch(verifyUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    otp: otp.trim(),
                }),
            });


            if (!response.ok) {
                const errorText = await response.text();
                console.error('OTP verify error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message || 'Email changed successfully!');
                // Close modal and refresh the page after success
                setTimeout(() => {
                    onClose();
                    window.location.reload();
                }, 2000);
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: data.message || 'Invalid verification code.' });
                }
            }
        } catch (error) {
            console.error('OTP verify error:', error);
            setErrors({ general: 'Network error. Please check your connection and try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async () => {
        const request = currentEmailChangeRequest || emailChangeRequest;
        if (!request) return;
        
        setIsResending(true);
        setCanResend(false);
        setResendTimer(30);
        setErrors({});

        try {
            const csrfToken = getCsrfTokenFromMeta();
            
            if (!csrfToken) {
                throw new Error('CSRF token not found in meta tag');
            }
            
            const response = await fetch(getApiEndpoint('resend', request.id.toString()), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({}),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message || 'New verification code sent!');
            } else {
                if (data.errors) {
                    setErrors(data.errors);
                } else {
                    setErrors({ general: data.message || 'Failed to resend verification code.' });
                }
            }
        } catch (error) {
            console.error('Resend OTP error:', error);
            setErrors({ general: 'Network error. Please check your connection and try again.' });
        } finally {
            setIsResending(false);
        }
    };

    const handleCancel = async () => {
        if (step === 'verify') {
            if (confirm('Are you sure you want to cancel the email change? This will discard the verification code and you\'ll need to start over.')) {
                const request = currentEmailChangeRequest || emailChangeRequest;
                if (request) {
                    try {
                        const csrfToken = getCsrfTokenFromMeta();
                        
                        if (!csrfToken) {
                            throw new Error('CSRF token not found in meta tag');
                        }
                        
                        const response = await fetch(getApiEndpoint('cancel', request.id.toString()), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRF-TOKEN': csrfToken,
                                'X-Requested-With': 'XMLHttpRequest',
                                'Accept': 'application/json',
                            },
                            body: JSON.stringify({}),
                        });

                        const data = await response.json();

                        if (data.success) {
                            onClose();
                            window.location.reload();
                        } else {
                            setErrors({ general: 'Failed to cancel email change request.' });
                        }
                    } catch (error) {
                        console.error('Cancel error:', error);
                        setErrors({ general: 'Network error. Please check your connection and try again.' });
                    }
                } else {
                    // If no request exists, just go back to email step
                    handleBackToEmail();
                }
            }
        } else {
            onClose();
        }
    };

    const handleBackToEmail = () => {
        setShowBackConfirmation(true);
    };

    const confirmBackToEmail = () => {
        setStep('email');
        setOtp('');
        setErrors({});
        setSuccess('');
        setTimeLeft(0);
        setShowBackConfirmation(false);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    const cancelBackToEmail = () => {
        setShowBackConfirmation(false);
    };

    return (
        <>
        <Dialog open={isOpen} onOpenChange={step === 'email' ? onClose : undefined}>
            <DialogContent className="sm:max-w-md" {...(step === 'verify' ? { hideCloseButton: true } : {})}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        {step === 'email' ? 'Change Email Address' : 'Verify Email Change'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'email' 
                            ? 'Enter your new email address. We\'ll send you a verification code to confirm the change.'
                            : `We've sent a 6-digit verification code to ${maskEmail(user.email)}`
                        }
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {step === 'email' ? (
                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="current-email">Current Email</Label>
                                <Input
                                    id="current-email"
                                    type="email"
                                    value={maskEmail(user.email)}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new-email">New Email Address</Label>
                                <Input
                                    id="new-email"
                                    type="email"
                                    value={emailData.new_email}
                                    onChange={(e) => setEmailData('new_email', e.target.value)}
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

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading || !emailData.new_email.trim()}
                                    className="flex-1 flex items-center gap-2"
                                >
                                    <Send className="h-4 w-4" />
                                    {isLoading ? 'Sending...' : 'Send Code'}
                                </Button>
                            </div>
                        </form>
                    ) : (
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
                                        {isResending ? 'Sending...' : canResend ? 'Resend' : `${resendTimer}s`}
                                    </Button>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleBackToEmail}
                                        disabled={isLoading}
                                        className="flex-1"
                                    >
                                        Back
                                    </Button>
                                </div>
                            </div>
                        </form>
                    )}

                    {step === 'email' && (
                        <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-medium text-sm mb-2">Important Notes:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• The verification code will expire in 15 minutes</li>
                                <li>• You'll need to verify your new email address after the change</li>
                                <li>• Make sure you have access to the new email address</li>
                            </ul>
                        </div>
                    )}

                    {step === 'verify' && (
                        <div className="p-4 bg-muted rounded-lg">
                            <h4 className="font-medium text-sm mb-2">Didn't receive the code?</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Check your spam/junk folder</li>
                                <li>• Make sure you entered the correct email address</li>
                                <li>• Wait 30 seconds before requesting a new code</li>
                                <li>• Contact support if you continue to have issues</li>
                            </ul>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>

        {/* Back Confirmation Modal */}
        <Dialog open={showBackConfirmation} onOpenChange={setShowBackConfirmation}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <X className="h-5 w-5 text-orange-500" />
                        Confirm Going Back
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to go back to the email entry step?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <Alert variant="destructive">
                        <AlertDescription>
                            <strong>Warning:</strong> Going back will invalidate your current verification code. 
                            You'll need to request a new verification code to continue with the email change process.
                        </AlertDescription>
                    </Alert>

                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={cancelBackToEmail}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={confirmBackToEmail}
                            className="flex-1"
                        >
                            Go Back
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
        </>
    );
}
