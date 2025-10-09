import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, X, RotateCcw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as DialogPrimitive from '@radix-ui/react-dialog';

interface EmailChangeOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  requestId: number;
  newEmail: string;
  currentEmail: string;
  allowClose?: boolean; // New prop to control close button visibility
}

export default function EmailChangeOtpModal({
  isOpen,
  onClose,
  onSuccess,
  requestId,
  newEmail,
  currentEmail,
  allowClose = true,
}: EmailChangeOtpModalProps) {
  // Memoize CustomDialogContent to prevent recreation on every render
  const CustomDialogContent = useMemo(() => {
    return ({ className, children, ...props }: React.ComponentProps<typeof DialogPrimitive.Content>) => {
      return (
        <DialogPortal>
          <DialogOverlay />
          <DialogPrimitive.Content
            className={cn(
              "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
              className
            )}
            {...props}
          >
            {children}
            {/* Only show close button if allowClose is true */}
            {allowClose && (
              <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            )}
          </DialogPrimitive.Content>
        </DialogPortal>
      );
    };
  }, [allowClose]);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes in seconds
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Countdown timer for OTP expiration - optimized to prevent unnecessary re-renders
  useEffect(() => {
    if (!isOpen) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isOpen]); // Removed timeLeft from dependencies to prevent recreation

  // Resend timer - optimized to prevent unnecessary re-renders
  useEffect(() => {
    if (!isOpen) return;

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
        resendTimerRef.current = null;
      }
    };
  }, [isOpen, resendTimer]);

  // Reset state when modal opens - optimized to prevent unnecessary updates
  useEffect(() => {
    if (isOpen) {
      // Use functional updates to prevent unnecessary re-renders
      setOtp('');
      setErrors({});
      setSuccess('');
      setTimeLeft(900);
      setResendTimer(30);
      setCanResend(false);
      setShowCancelConfirm(false);
    }
  }, [isOpen]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Memoize formatted time to prevent unnecessary re-renders
  const formattedTime = useMemo(() => formatTime(timeLeft), [timeLeft, formatTime]);

  const handleVerifyOtp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const response = await fetch(`/customer/profile/email-change/verify/${requestId}`, {
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
        setTimeout(() => {
          onSuccess();
          onClose();
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
  }, [requestId, otp, onSuccess]);

  const handleResendOtp = useCallback(async () => {
    setIsResending(true);
    setCanResend(false);
    setResendTimer(30);
    setErrors({});

    try {
      const response = await fetch(`/customer/profile/email-change/resend/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setTimeLeft(900); // Reset expiration timer
      } else {
        setErrors({ general: data.message || 'Failed to resend verification code.' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    } finally {
      setIsResending(false);
    }
  }, [requestId]);

  const handleCancel = useCallback(async () => {
    try {
      const response = await fetch(`/customer/profile/email-change/cancel/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
      });

      const data = await response.json();

      if (data.success) {
        setShowCancelConfirm(false);
        onClose();
      } else {
        setErrors({ general: 'Failed to cancel email change request.' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please check your connection and try again.' });
    }
  }, [requestId, onClose]);

  const handleClose = useCallback(() => {
    // Always show confirmation dialog when attempting to close
    setShowCancelConfirm(true);
  }, []);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <CustomDialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="h-5 w-5" />
              Verify Email Change
            </DialogTitle>
            <DialogDescription>
              We've sent a 6-digit verification code to your current email address{' '}
              <strong>{currentEmail}</strong> to confirm changing it to{' '}
              <strong>{newEmail}</strong>.
            </DialogDescription>
          </DialogHeader>

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
                Code expires in: <strong>{formattedTime}</strong>
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

                {allowClose && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={isLoading}
                    className="flex-1 flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </form>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Didn't receive the code?</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you have access to {currentEmail}</li>
              <li>• Wait 30 seconds before requesting a new code</li>
            </ul>
          </div>
        </CustomDialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Cancel Email Change?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel the email change? This will discard the verification code and you'll need to start over if you want to change your email address.
            </DialogDescription>
          </DialogHeader>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCancelConfirm(false)}
              className="flex-1"
            >
              Keep Trying
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel Email Change
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
