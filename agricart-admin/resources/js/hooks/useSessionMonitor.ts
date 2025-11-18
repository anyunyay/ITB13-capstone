import { useEffect, useState } from 'react';
import axios from 'axios';

interface SessionStatus {
    valid: boolean;
    reason?: string;
    message?: string;
}

export function useSessionMonitor(isAuthenticated: boolean) {
    const [sessionEnded, setSessionEnded] = useState(false);
    const [endReason, setEndReason] = useState<string>('');

    useEffect(() => {
        if (!isAuthenticated) {
            return;
        }

        // Poll session status every 5 seconds
        const interval = setInterval(async () => {
            try {
                const response = await axios.get<SessionStatus>('/api/session/check');
                
                if (!response.data.valid) {
                    setSessionEnded(true);
                    setEndReason(response.data.message || 'Your session has ended.');
                    clearInterval(interval);
                }
            } catch (error) {
                // If we get a 401 or 419, session is invalid
                if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 419)) {
                    setSessionEnded(true);
                    setEndReason('Your session has expired.');
                    clearInterval(interval);
                }
            }
        }, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, [isAuthenticated]);

    return { sessionEnded, endReason };
}
