import { useState, useEffect } from 'react';

interface SystemStatus {
    status_key: string;
    status_value: 'open' | 'locked' | 'pending_lock';
    lock_time?: string;
    remaining_seconds: number;
    updated_by?: number;
    updated_at: string;
}

export function useSystemLock() {
    const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
    const [countdown, setCountdown] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch system status with optimized caching and error handling
    const fetchSystemStatus = async () => {
        try {
            const response = await fetch('/api/system/status', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                    'Cache-Control': 'no-cache',
                },
                credentials: 'same-origin',
            });

            if (response.ok) {
                const data = await response.json();
                const previousStatus = systemStatus?.status_value;
                
                setSystemStatus(data);
                
                if (data.status_value === 'pending_lock') {
                    setCountdown(data.remaining_seconds);
                }
                
                // Log state changes for debugging
                if (previousStatus !== data.status_value) {
                    console.log('System lock state changed:', {
                        from: previousStatus,
                        to: data.status_value,
                        countdown: data.remaining_seconds,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch system status:', error);
        }
    };

    // Countdown effect with real-time updates
    useEffect(() => {
        if (systemStatus?.status_value === 'pending_lock' && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        // Countdown finished, refresh status immediately
                        fetchSystemStatus();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [systemStatus?.status_value, countdown]);

    // Initial fetch and periodic updates for real-time state synchronization
    useEffect(() => {
        fetchSystemStatus();
        
        // Refresh every 5 seconds for more responsive updates
        const interval = setInterval(fetchSystemStatus, 5000);
        return () => clearInterval(interval);
    }, []);

    const isPendingLock = systemStatus?.status_value === 'pending_lock';
    const isLocked = systemStatus?.status_value === 'locked';
    const isOpen = systemStatus?.status_value === 'open';

    // Check if buttons should be disabled - disabled during countdown, enabled only when countdown completes (locked)
    const shouldDisableButtons = isPendingLock || isOpen;

    // Debug logging for real-time state changes
    useEffect(() => {
        if (systemStatus) {
            console.log('System lock state changed:', {
                status: systemStatus.status_value,
                countdown,
                shouldDisableButtons,
                timestamp: new Date().toISOString()
            });
        }
    }, [systemStatus?.status_value, countdown, shouldDisableButtons]);

    return {
        systemStatus,
        countdown,
        isLoading,
        isPendingLock,
        isLocked,
        isOpen,
        shouldDisableButtons,
        fetchSystemStatus,
    };
}
