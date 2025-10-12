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

    const isPendingLock = systemStatus?.status_value === 'pending_lock';
    const isLocked = systemStatus?.status_value === 'locked';
    const isOpen = systemStatus?.status_value === 'open';

    // Check if buttons should be disabled - disabled during countdown, enabled only when countdown completes (locked)
    const shouldDisableButtons = isPendingLock || isOpen;

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
