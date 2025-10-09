import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { Mail, Send, Check, X, RotateCcw } from 'lucide-react';
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

interface EmailChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    emailChangeRequest?: EmailChangeRequest;
}

export default function EmailChangeModal({ isOpen, onClose, user, emailChangeRequest }: EmailChangeModalProps) {
    const [step, setStep] = useState<'email' | 'verify'>('email');
    const [newEmail, setNewEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState('');
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [currentEmailChangeRequest, setCurrentEmailChangeRequest] = useState<EmailChangeRequest | null>(null);
    
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const resendTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setStep('email');
            setNewEmail('');
            setOtp('');
            setErrors({});
            setSuccess('');
            setResendTimer(30);
            setCanResend(false);
            setIsResending(false);
            setTimeLeft(0);
            setCurrentEmailChangeRequest(null);
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

        try {
            const response = await fetch('/customer/profile/email-change/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    new_email: newEmail,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                // Set the email change request from the response
                if (data.emailChangeRequest) {
                    setCurrentEmailChangeRequest(data.emailChangeRequest);
                }
                // Transition to verification step
                setStep('verify');
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
            const response = await fetch(`/customer/profile/email-change/verify/${request.id}`, {
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
            const response = await fetch(`/customer/profile/email-change/resend/${request.id}`, {
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
        const request = currentEmailChangeRequest || emailChangeRequest;
        if (request && step === 'verify') {
            if (confirm('Are you sure you want to cancel the email change? This will discard the verification code.')) {
                try {
                    const response = await fetch(`/customer/profile/email-change/cancel/${request.id}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                        },
                    });

                    const data = await response.json();

                    if (data.success) {
                        onClose();
                        window.location.reload();
                    } else {
                        setErrors({ general: 'Failed to cancel email change request.' });
                    }
                } catch (error) {
                    setErrors({ general: 'Network error. Please check your connection and try again.' });
                }
            }
        } else {
            onClose();
        }
    };

    const handleBackToEmail = () => {
        setStep('email');
        setOtp('');
        setErrors({});
        setSuccess('');
        setTimeLeft(0);
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        {step === 'email' ? 'Change Email Address' : 'Verify Email Change'}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 'email' 
                            ? 'Enter your new email address. We\'ll send you a verification code to confirm the change.'
                            : `We've sent a 6-digit verification code to ${(currentEmailChangeRequest || emailChangeRequest)?.new_email}`
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
                                    disabled={isLoading || !newEmail.trim()}
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
    );
}
