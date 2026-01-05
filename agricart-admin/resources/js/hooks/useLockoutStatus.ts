import { useState, useEffect, useCallback } from 'react';
import { router } from '@inertiajs/react';

interface LockoutStatus {
    locked: boolean;
    failed_attempts: number;
    lock_level: number;
    remaining_time: number;
    lock_expires_at: string | null;
    server_time: string;
    formatted_time: string | null;
}

interface UseLockoutStatusProps {
    identifier: string;
    userType: 'customer' | 'admin' | 'member' | 'logistic';
}

export function useLockoutStatus({ identifier, userType }: UseLockoutStatusProps) {
    const [lockoutStatus, setLockoutStatus] = useState<LockoutStatus | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    const checkLockoutStatus = useCallback(async () => {
        if (!identifier.trim()) return;

        setIsChecking(true);
        try {
            const response = await fetch(route(`api.lockout.${userType}.check`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    [userType === 'member' ? 'member_id' : 'email']: identifier,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setLockoutStatus(data);
                
                // Store in localStorage for persistence across refreshes
                localStorage.setItem(`lockout_${userType}_${identifier}`, JSON.stringify({
                    ...data,
                    checked_at: new Date().toISOString(),
                }));
            }
        } catch (error) {
            console.error('Error checking lockout status:', error);
        } finally {
            setIsChecking(false);
        }
    }, [identifier, userType]);

    // Check lockout status when identifier changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            checkLockoutStatus();
        }, 500); // Debounce for 500ms

        return () => clearTimeout(timeoutId);
    }, [checkLockoutStatus]);

    // Load persisted state on mount
    useEffect(() => {
        const storageKey = `lockout_${userType}_${identifier}`;
        const persisted = localStorage.getItem(storageKey);
        
        if (persisted) {
            try {
                const data = JSON.parse(persisted);
                const checkedAt = new Date(data.checked_at);
                const now = new Date();
                
                // Only use persisted data if it's less than 5 minutes old
                if (now.getTime() - checkedAt.getTime() < 5 * 60 * 1000) {
                    setLockoutStatus(data);
                } else {
                    // Data is stale, check fresh status
                    checkLockoutStatus();
                }
            } catch (error) {
                console.error('Error parsing persisted lockout data:', error);
                checkLockoutStatus();
            }
        } else {
            checkLockoutStatus();
        }
    }, [identifier, userType, checkLockoutStatus]);

    const refreshLockoutStatus = useCallback(() => {
        checkLockoutStatus();
    }, [checkLockoutStatus]);

    const clearPersistedStatus = useCallback(() => {
        const storageKey = `lockout_${userType}_${identifier}`;
        localStorage.removeItem(storageKey);
        setLockoutStatus(null);
    }, [identifier, userType]);

    return {
        lockoutStatus,
        isChecking,
        refreshLockoutStatus,
        clearPersistedStatus,
    };
}
