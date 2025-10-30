import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle, Info } from "lucide-react"
import { useTranslation } from '@/hooks/use-translation'

interface FlashMessageProps {
    flash?: {
        type?: 'success' | 'error' | 'info';
        message?: string;
    };
    className?: string;
}

export function FlashMessage({ flash, className = "" }: FlashMessageProps) {
    const t = useTranslation();
    
    if (!flash || !flash.message) {
        return null;
    }

    const getAlertStyle = () => {
        switch (flash.type) {
            case 'error':
                return "border-red-200 bg-red-50 text-red-800";
            case 'success':
                return "border-green-200 bg-green-50 text-green-800";
            case 'info':
                return "border-blue-200 bg-blue-50 text-blue-800";
            default:
                return "border-gray-200 bg-gray-50 text-gray-800";
        }
    };

    const getIcon = () => {
        switch (flash.type) {
            case 'error':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'success':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'info':
                return <Info className="h-4 w-4 text-blue-500" />;
            default:
                return <Info className="h-4 w-4 text-gray-500" />;
        }
    };

    const getTitle = () => {
        switch (flash.type) {
            case 'error':
                return t('ui.error_title');
            case 'success':
                return t('ui.success_title');
            case 'info':
                return t('ui.information');
            default:
                return t('ui.notification');
        }
    };

    return (
        <Alert className={`${getAlertStyle()} ${className}`}>
            {getIcon()}
            <AlertTitle>{getTitle()}</AlertTitle>
            <AlertDescription>{flash.message}</AlertDescription>
        </Alert>
    );
}
