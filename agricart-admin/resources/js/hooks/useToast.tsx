import { useState, useCallback } from 'react';
import { ToastProps } from '@/components/ui/toast';

export function useToast() {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const addToast = useCallback((toast: Omit<ToastProps, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast: ToastProps = {
            ...toast,
            id,
        };
        
        setToasts(prev => [...prev, newToast]);
        
        return id;
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showSuccess = useCallback((message: string, title?: string, duration?: number) => {
        return addToast({
            type: 'success',
            title,
            message,
            duration,
        });
    }, [addToast]);

    const showError = useCallback((message: string, title?: string, duration?: number) => {
        return addToast({
            type: 'error',
            title,
            message,
            duration,
        });
    }, [addToast]);

    const showInfo = useCallback((message: string, title?: string, duration?: number) => {
        return addToast({
            type: 'info',
            title,
            message,
            duration,
        });
    }, [addToast]);

    const showWarning = useCallback((message: string, title?: string, duration?: number) => {
        return addToast({
            type: 'warning',
            title,
            message,
            duration,
        });
    }, [addToast]);

    const clearAll = useCallback(() => {
        setToasts([]);
    }, []);

    return {
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        clearAll,
    };
}
