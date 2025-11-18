import { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface SessionEndedModalProps {
    isOpen: boolean;
    reason: string;
}

export default function SessionEndedModal({ isOpen, reason }: SessionEndedModalProps) {
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        if (!isOpen) return;

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen]);

    const handleLogout = () => {
        router.post('/logout', {}, {
            onFinish: () => {
                window.location.href = '/';
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md" hideCloseButton>
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                            <AlertCircle className="h-5 w-5 text-destructive" />
                        </div>
                        <DialogTitle className="text-xl">Your Session Has Ended</DialogTitle>
                    </div>
                    <DialogDescription className="pt-4 text-base space-y-3">
                        <p>
                            Your previous session has been automatically closed because your account was accessed from another device or browser.
                        </p>
                        <p>
                            For your security, the system only allows one active session at a time.
                        </p>
                        <p className="font-semibold text-foreground">
                            If this wasn't you, please change your password immediately to protect your account.
                        </p>
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground text-center">
                        You will be logged out in <span className="font-semibold text-foreground">{countdown}</span> seconds
                    </p>
                </div>

                <DialogFooter>
                    <Button 
                        onClick={handleLogout}
                        className="w-full"
                        variant="default"
                    >
                        Return to Login Now
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
