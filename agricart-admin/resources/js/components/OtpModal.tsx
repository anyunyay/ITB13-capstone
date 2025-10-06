import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface OtpModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (otp: string) => void;
    onResend: () => void;
    email: string;
    isLoading: boolean;
    error: string;
    expiresIn: number; // in seconds
    isWaitingForOtp?: boolean; // New prop to indicate if we're waiting for OTP to be sent
}

export function OtpModal({
    isOpen,
    onClose,
    onVerify,
    onResend,
    email,
    isLoading,
    error,
    expiresIn,
    isWaitingForOtp = false
}: OtpModalProps) {
    const [otp, setOtp] = useState('');
    const [timeLeft, setTimeLeft] = useState(expiresIn);
    const [canResend, setCanResend] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Timer effect
    useEffect(() => {
        if (!isOpen) {
            setTimeLeft(expiresIn);
            setCanResend(false);
            setOtp('');
            setHasSubmitted(false);
            setIsOtpSent(false);
            return;
        }

        // Auto-focus on input when modal opens
        if (inputRef.current) {
            inputRef.current.focus();
        }

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
    }, [isOpen, expiresIn]);

    // Detect when OTP has been sent
    useEffect(() => {
        if (!isWaitingForOtp && isOpen) {
            setIsOtpSent(true);
        }
    }, [isWaitingForOtp, isOpen]);

    // Auto-submit when 6 digits are entered
    useEffect(() => {
        if (otp.length === 6 && !isLoading && !isWaitingForOtp && !hasSubmitted) {
            setHasSubmitted(true);
            handleVerify();
        }
    }, [otp, isLoading, isWaitingForOtp, hasSubmitted]);

    // Reset hasSubmitted when there's an error
    useEffect(() => {
        if (error) {
            setHasSubmitted(false);
        }
    }, [error]);

    const handleVerify = () => {
        if (otp.length === 6) {
            onVerify(otp);
        }
    };

    const handleResend = () => {
        setTimeLeft(expiresIn);
        setCanResend(false);
        setOtp('');
        setHasSubmitted(false);
        setIsOtpSent(false); // Reset OTP sent flag when resending
        onResend();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            // Prevent closing if OTP has been sent, unless explicitly cancelled
            if (!open && isOtpSent) {
                return; // Don't close the modal
            }
            onClose();
        }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Enter Verification Code</DialogTitle>
                    <DialogDescription>
                        {isWaitingForOtp ? (
                            <>Sending verification code to <strong>{email}</strong>...</>
                        ) : (
                            <>We've sent a 6-digit verification code to <strong>{email}</strong></>
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
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
                            placeholder={isWaitingForOtp ? "Waiting for code..." : "Enter 6-digit code"}
                            className="text-center text-lg tracking-widest font-mono"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleVerify();
                                }
                            }}
                            disabled={isLoading || isWaitingForOtp}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span className={timeLeft <= 10 ? 'text-red-500 font-medium' : ''}>
                                {timeLeft > 0 ? `Code expires in ${formatTime(timeLeft)}` : 'Code expired'}
                            </span>
                        </div>

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResend}
                            disabled={!canResend || isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Resend Code'}
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
                            disabled={otp.length !== 6 || isLoading || isWaitingForOtp || hasSubmitted}
                            className="flex-1"
                        >
                            {isLoading ? 'Verifying...' : isWaitingForOtp ? 'Waiting for Code...' : hasSubmitted ? 'Verifying...' : 'Verify Code'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsOtpSent(false);
                                onClose();
                            }}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

