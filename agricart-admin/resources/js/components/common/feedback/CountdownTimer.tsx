import { useEffect, useState } from 'react';

interface CountdownTimerProps {
    lockExpiresAt: string | null; // ISO string from server
    serverTime: string; // ISO string from server
    onComplete?: () => void;
    className?: string;
}

export default function CountdownTimer({ lockExpiresAt, serverTime, onComplete, className = '' }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!lockExpiresAt) {
            setTimeLeft(0);
            return;
        }

        const calculateTimeLeft = () => {
            const now = new Date();
            const expiresAt = new Date(lockExpiresAt);
            const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
            return remaining;
        };

        // Initial calculation
        setTimeLeft(calculateTimeLeft());

        // Update every second
        const timer = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);
            
            if (remaining <= 0) {
                onComplete?.();
                clearInterval(timer);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [lockExpiresAt, serverTime, onComplete]);

    const formatTime = (seconds: number): string => {
        if (seconds < 60) {
            return `${seconds}s`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = seconds % 60;
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    };

    if (timeLeft <= 0) {
        return null;
    }

    return (
        <span className={`font-mono ${className}`}>
            {formatTime(timeLeft)}
        </span>
    );
}
