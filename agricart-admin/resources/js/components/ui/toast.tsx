import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export interface ToastProps {
    id?: string;
    type: 'success' | 'error' | 'info' | 'warning';
    title?: string;
    message: string;
    duration?: number;
    onClose?: () => void;
}

export function Toast({ 
    type, 
    title, 
    message, 
    duration = 5000, 
    onClose 
}: ToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => onClose?.(), 300); // Allow fade out animation
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300);
    };

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            case 'info':
                return <Info className="h-5 w-5 text-blue-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
            case 'info':
                return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
            default:
                return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
        }
    };

    const getTextColor = () => {
        switch (type) {
            case 'success':
                return 'text-green-800 dark:text-green-200';
            case 'error':
                return 'text-red-800 dark:text-red-200';
            case 'warning':
                return 'text-yellow-800 dark:text-yellow-200';
            case 'info':
                return 'text-blue-800 dark:text-blue-200';
            default:
                return 'text-blue-800 dark:text-blue-200';
        }
    };

    if (!isVisible) return null;

    return (
        <div
            className={`
                fixed top-4 right-4 z-50 max-w-sm w-full
                ${getBackgroundColor()}
                border rounded-lg shadow-lg
                transform transition-all duration-300 ease-in-out
                ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            `}
        >
            <div className="p-4">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        {getIcon()}
                    </div>
                    <div className="ml-3 w-0 flex-1">
                        {title && (
                            <p className={`text-sm font-medium ${getTextColor()}`}>
                                {title}
                            </p>
                        )}
                        <p className={`text-sm ${getTextColor()} ${title ? 'mt-1' : ''}`}>
                            {message}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0 flex">
                        <button
                            onClick={handleClose}
                            className={`
                                inline-flex rounded-md p-1.5
                                ${getTextColor()} hover:bg-black/5 dark:hover:bg-white/5
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                            `}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

interface ToastContainerProps {
    toasts: ToastProps[];
    onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    {...toast}
                    onClose={() => toast.id && onRemove(toast.id)}
                />
            ))}
        </div>
    );
}
