import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BellDot, CheckCircle, AlertTriangle } from 'lucide-react';
import { PasswordChangeRequest } from '../../types/membership';
import { useTranslation } from '@/hooks/use-translation';

interface FlashMessagesProps {
    flash: {
        message?: string;
        error?: string;
    };
    newRequest: PasswordChangeRequest | null;
    onNavigateToMember: (memberId: number) => void;
    onDismissNewRequest: () => void;
}

export const FlashMessages = ({
    flash,
    newRequest,
    onNavigateToMember,
    onDismissNewRequest
}: FlashMessagesProps) => {
    const t = useTranslation();
    return (
        <div className="space-y-3">
            {flash.message && (
                <Alert className="border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200 mb-4 shadow-md">
                    <CheckCircle className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                    <AlertTitle className="font-semibold">{t('admin.notification')}</AlertTitle>
                    <AlertDescription>{flash.message}</AlertDescription>
                </Alert>
            )}
            
            {flash.error && (
                <Alert className="border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200 mb-4 shadow-md">
                    <AlertTriangle className='h-4 w-4 text-red-600 dark:text-red-400' />
                    <AlertTitle className="font-semibold">{t('admin.error_title')}</AlertTitle>
                    <AlertDescription>{flash.error}</AlertDescription>
                </Alert>
            )}
            
            {newRequest && (
                <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => {
                        onNavigateToMember(newRequest.member.id);
                        onDismissNewRequest();
                    }}
                >
                    <Alert className="cursor-pointer border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-200 mb-4 shadow-md hover:shadow-lg transition-shadow">
                        <BellDot className='h-4 w-4 text-green-600 dark:text-green-400' />
                        <AlertTitle className="font-semibold">{t('admin.new_password_change_request')}</AlertTitle>
                        <AlertDescription>
                            {t('admin.new_password_request_message', {name: newRequest.member.name})}
                        </AlertDescription>
                    </Alert>
                </button>
            )}
        </div>
    );
};
