import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Lock, Unlock, Clock, X } from 'lucide-react';

interface SystemStatus {
    status_key: string;
    status_value: 'open' | 'locked' | 'pending_lock';
    lock_time?: string;
    remaining_seconds: number;
    updated_by?: number;
    updated_at: string;
}

interface SystemLockManagerProps {
    className?: string;
}

export function SystemLockManager({ className }: SystemLockManagerProps) {
    const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [showLockConfirm, setShowLockConfirm] = useState(false);
    const [showUnlockConfirm, setShowUnlockConfirm] = useState(false);

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
                }
            }
        } catch (error) {
            console.error('Failed to fetch system status:', error);
        }
    };

    // Schedule lock
    const scheduleLock = async () => {
        setShowLockConfirm(false);
        setIsLoading(true);
        try {
            const response = await fetch('/api/system/lock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error:', response.status, errorText);
                
                if (response.status === 419) {
                    alert('CSRF token mismatch. Please refresh the page and try again.');
                } else if (response.status === 401) {
                    alert('You must be logged in to perform this action.');
                } else {
                    alert(`Failed to schedule lock: ${response.status} ${response.statusText}`);
                }
                return;
            }

            const data = await response.json();
            alert(data.message);
            await fetchSystemStatus();
        } catch (error) {
            console.error('Failed to schedule lock:', error);
            alert('Failed to schedule lock: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsLoading(false);
        }
    };

    // Unlock system
    const unlockSystem = async () => {
        setShowUnlockConfirm(false);
        setIsLoading(true);
        try {
            const response = await fetch('/api/system/unlock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Response error:', response.status, errorText);
                
                if (response.status === 419) {
                    alert('CSRF token mismatch. Please refresh the page and try again.');
                } else if (response.status === 401) {
                    alert('You must be logged in to perform this action.');
                } else {
                    alert(`Failed to unlock system: ${response.status} ${response.statusText}`);
                }
                return;
            }

            const data = await response.json();
            alert(data.message);
            await fetchSystemStatus();
        } catch (error) {
            console.error('Failed to unlock system:', error);
            alert('Failed to unlock system: ' + (error instanceof Error ? error.message : 'Unknown error'));
        } finally {
            setIsLoading(false);
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
                    if (prev <= 1) {
                        // Countdown finished, refresh status
                        fetchSystemStatus();
                        return 0;
                    }
                    return prev - 1;
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
    const isOpen = systemStatus.status_value === 'open';

    return (
        <div className={className}>
            {/* Countdown Banner */}
            {isPendingLock && (
                <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Clock className="h-5 w-5 text-orange-600" />
                            <span className="font-medium text-orange-800">
                                System will lock in: {formatCountdown(countdown)}
                            </span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={unlockSystem}
                            disabled={isLoading}
                            className="text-orange-600 border-orange-300 hover:bg-orange-100"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Cancel Lock
                        </Button>
                    </div>
                </div>
            )}

            {/* Locked Banner */}
            {isLocked && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                        <Lock className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-red-800">
                            System is currently locked for maintenance
                        </span>
                    </div>
                </div>
            )}

            {/* Control Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span>System Lock Management</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Status Display */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">Current Status</p>
                            <div className="flex items-center space-x-2 mt-1">
                                {isOpen && (
                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                        <Unlock className="h-3 w-3 mr-1" />
                                        Open
                                    </Badge>
                                )}
                                {isPendingLock && (
                                    <Badge variant="default" className="bg-orange-100 text-orange-800">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Pending Lock
                                    </Badge>
                                )}
                                {isLocked && (
                                    <Badge variant="destructive">
                                        <Lock className="h-3 w-3 mr-1" />
                                        Locked
                                    </Badge>
                                )}
                            </div>
                        </div>
                        {systemStatus.lock_time && (
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Lock Time</p>
                                <p className="text-sm font-medium">
                                    {new Date(systemStatus.lock_time).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                        {isOpen && (
                            <Button
                                onClick={() => setShowLockConfirm(true)}
                                disabled={isLoading}
                                variant="outline"
                                className="text-orange-600 border-orange-300 hover:bg-orange-50"
                            >
                                <Clock className="h-4 w-4 mr-2" />
                                Lock Customer Side (1-minute countdown)
                            </Button>
                        )}
                        
                        {isLocked && (
                            <Button
                                onClick={() => setShowUnlockConfirm(true)}
                                disabled={isLoading}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Unlock className="h-4 w-4 mr-2" />
                                Unlock Customer Side
                            </Button>
                        )}
                    </div>

                    {/* Info Text */}
                    <div className="text-sm text-muted-foreground">
                        <p>
                            When locked, customers will see a maintenance message and cannot access checkout or cart features.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Lock Confirmation Dialog */}
            <Dialog open={showLockConfirm} onOpenChange={setShowLockConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                            <span>Confirm System Lock</span>
                        </DialogTitle>
                        <DialogDescription>
                            Lock the customer system in 1 minute? Customers will see warnings and be logged out when the countdown ends.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowLockConfirm(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={scheduleLock}
                            disabled={isLoading}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {isLoading ? 'Scheduling...' : 'Confirm Lock'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Unlock Confirmation Dialog */}
            <Dialog open={showUnlockConfirm} onOpenChange={setShowUnlockConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <Unlock className="h-5 w-5 text-green-600" />
                            <span>Confirm System Unlock</span>
                        </DialogTitle>
                        <DialogDescription>
                            Unlock customer access now? Customers will be able to access the system immediately.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowUnlockConfirm(false)}>
                            Cancel
                        </Button>
                        <Button 
                            onClick={unlockSystem}
                            disabled={isLoading}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isLoading ? 'Unlocking...' : 'Confirm Unlock'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

// Default export for compatibility
export default SystemLockManager;