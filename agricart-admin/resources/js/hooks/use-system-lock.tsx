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
    const [serverTimeOffset, setServerTimeOffset] = useState(0);

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
                
                // Calculate server time offset for accurate timing
                const serverTime = new Date(data.updated_at).getTime();
                const clientTime = new Date().getTime();
                const offset = serverTime - clientTime;
                setServerTimeOffset(offset);
                
                setSystemStatus(data);
                
                // Calculate countdown from server timestamp with offset correction
                if (data.status_value === 'pending_lock' && data.lock_time) {
                    const lockTime = new Date(data.lock_time).getTime();
                    const currentTime = new Date().getTime() + offset;
                    const remainingMs = lockTime - currentTime;
                    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
                    setCountdown(remainingSeconds);
                } else {
                    setCountdown(0);
                }
                
                // Log state changes for debugging
                if (previousStatus !== data.status_value) {
                    console.log('System lock state changed:', {
                        from: previousStatus,
                        to: data.status_value,
                        lockTime: data.lock_time,
                        serverTimeOffset: offset,
                        remainingSeconds: data.status_value === 'pending_lock' ? Math.max(0, Math.ceil((new Date(data.lock_time).getTime() - (new Date().getTime() + offset)) / 1000)) : 0,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        } catch (error) {
            console.error('Failed to fetch system status:', error);
        }
    };

    // Countdown effect with server-synchronized timing
    useEffect(() => {
        if (systemStatus?.status_value === 'pending_lock' && systemStatus.lock_time) {
            const timer = setInterval(() => {
                const lockTime = new Date(systemStatus.lock_time!).getTime();
                const currentTime = new Date().getTime() + serverTimeOffset;
                const remainingMs = lockTime - currentTime;
                const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
                
                if (remainingSeconds <= 0) {
                    // Countdown finished, refresh status immediately
                    fetchSystemStatus();
                    setCountdown(0);
                } else {
                    setCountdown(remainingSeconds);
                }
            }, 100); // Update every 100ms for smooth countdown

            return () => clearInterval(timer);
        }
    }, [systemStatus?.status_value, systemStatus?.lock_time, serverTimeOffset]);

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
