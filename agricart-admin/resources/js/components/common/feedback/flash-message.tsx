import { AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react"
import { useTranslation } from '@/hooks/use-translation'

interface FlashMessageProps {
    flash?: {
        type?: 'success' | 'error' | 'info' | 'warning';
        message?: string;
        error?: string;
    };
    className?: string;
}

export function FlashMessage({ flash, className = "" }: FlashMessageProps) {
    const t = useTranslation();
    
    // Handle both flash.message and flash.error
    const message = flash?.message || flash?.error;
    // If error exists, use 'error' type
    // If type is explicitly set, use that
    // If message exists without type, default to 'success' (green)
    // Otherwise default to 'info' (blue)
    const messageType = flash?.error 
        ? 'error' 
        : (flash?.type || (flash?.message ? 'success' : 'info'));
    
    if (!flash || !message) {
        return null;
    }

    const getAlertStyle = () => {
        switch (messageType) {
            case 'error':
                return "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200";
            case 'success':
                return "border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-200";
            case 'warning':
                return "border-yellow-300 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200";
            case 'info':
                return "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200";
            default:
                return "border-gray-300 bg-gray-50 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200";
        }
    };

    const getIcon = () => {
        switch (messageType) {
            case 'error':
                return <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />;
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />;
            case 'warning':
                return <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />;
            case 'info':
                return <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />;
            default:
                return <Info className="h-4 w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />;
        }
    };

    const getTitle = () => {
        switch (messageType) {
            case 'error':
                return t('ui.error_title') || t('admin.error_title') || 'Error';
            case 'success':
                return t('ui.success_title') || t('admin.success') || 'Success';
            case 'warning':
                return t('ui.warning_title') || 'Warning';
            case 'info':
                return t('ui.information') || t('admin.notification') || 'Information';
            default:
                return t('ui.notification') || t('admin.notification') || 'Notification';
        }
    };

    return (
        <div 
            role="alert"
            className={`relative w-full rounded-lg border px-4 py-3 mb-4 shadow-md ${getAlertStyle()} ${className}`}
        >
            <div className="flex gap-3 items-start">
                {getIcon()}
                <div className="flex-1 space-y-1">
                    <div className="font-semibold text-sm leading-none tracking-tight">
                        {getTitle()}
                    </div>
                    <div className="text-sm opacity-90">
                        {message}
                    </div>
                </div>
            </div>
        </div>
    );
}
