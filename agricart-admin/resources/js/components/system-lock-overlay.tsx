import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Lock, Clock, X } from 'lucide-react';

interface SystemStatus {
    status_key: string;
    status_value: 'open' | 'locked' | 'pending_lock';
    lock_time?: string;
    remaining_seconds: number;
    updated_by?: number;
    updated_at: string;
}

interface SystemLockOverlayProps {
    className?: string;
}

export function SystemLockOverlay({ className }: SystemLockOverlayProps) {
    const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
    const [countdown, setCountdown] = useState(0);
    const [showWarning10, setShowWarning10] = useState(false);
    const [showWarning5, setShowWarning5] = useState(false);
    const [showLockedOverlay, setShowLockedOverlay] = useState(false);

    // Fetch system status
    const fetchSystemStatus = async () => {
        try {
            const response = await fetch('/api/system/status', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                setSystemStatus(data);
                
                if (data.status_value === 'pending_lock') {
                    setCountdown(data.remaining_seconds);
                    
                    // Show warning modals
                    if (data.remaining_seconds <= 600 && data.remaining_seconds > 300) { // 10 minutes
                        setShowWarning10(true);
                    } else if (data.remaining_seconds <= 300 && data.remaining_seconds > 0) { // 5 minutes
                        setShowWarning5(true);
                    }
                } else if (data.status_value === 'locked') {
                    setShowLockedOverlay(true);
                }
            }
        } catch (error) {
            console.error('Failed to fetch system status:', error);
        }
    };

    // Format countdown time
    const formatCountdown = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Countdown effect
    useEffect(() => {
        if (systemStatus?.status_value === 'pending_lock' && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    const newCountdown = prev - 1;
                    
                    // Show warning modals
                    if (newCountdown === 10) { // 10 seconds exactly
                        setShowWarning10(true);
                    } else if (newCountdown === 5) { // 5 seconds exactly
                        setShowWarning5(true);
                    }
                    
                    if (newCountdown <= 0) {
                        // Countdown finished, refresh status
                        fetchSystemStatus();
                        return 0;
                    }
                    return newCountdown;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [systemStatus?.status_value, countdown]);

    // Initial fetch
    useEffect(() => {
        fetchSystemStatus();
        
        // Refresh every 30 seconds
        const interval = setInterval(fetchSystemStatus, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!systemStatus) {
        return null;
    }

    const isPendingLock = systemStatus.status_value === 'pending_lock';
    const isLocked = systemStatus.status_value === 'locked';

    return (
        <div className={className}>
            {/* 10-minute warning modal */}
            <Dialog open={showWarning10} onOpenChange={setShowWarning10}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            <span>System Lock Warning</span>
                        </DialogTitle>
                        <DialogDescription>
                            ⚠️ The system will be locked in 30 seconds for price updates. Please finish checkout.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end">
                        <Button onClick={() => setShowWarning10(false)}>
                            Understood
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 5-minute warning modal */}
            <Dialog open={showWarning5} onOpenChange={setShowWarning5}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <span>Final Warning</span>
                        </DialogTitle>
                        <DialogDescription>
                            ⚠️ The system will be locked in 5 seconds. Complete your purchase now.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end">
                        <Button onClick={() => setShowWarning5(false)}>
                            Complete Purchase
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Locked system overlay */}
            {isLocked && showLockedOverlay && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
                        <div className="flex items-center justify-center mb-4">
                            <Lock className="h-12 w-12 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            🚫 System Locked for Maintenance
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Please check back later. We are currently updating our prices and system.
                        </p>
                        <Button 
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Refresh Page
                        </Button>
                    </div>
                </div>
            )}

            {/* Pending lock banner */}
            {isPendingLock && countdown > 0 && (
                <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white p-3 text-center z-40">
                    <div className="flex items-center justify-center space-x-2">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">
                            System will lock in: {formatCountdown(countdown)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
