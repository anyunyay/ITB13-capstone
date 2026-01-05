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
                <div 
                    role="alert"
                    className="relative w-full rounded-lg border px-4 py-3 mb-4 shadow-md border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200"
                >
                    <div className="flex gap-3 items-start">
                        <CheckCircle className='h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0' />
                        <div className="flex-1 space-y-1">
                            <div className="font-semibold text-sm leading-none tracking-tight">{t('admin.notification')}</div>
                            <div className="text-sm opacity-90">{flash.message}</div>
                        </div>
                    </div>
                </div>
            )}
            
            {flash.error && (
                <div 
                    role="alert"
                    className="relative w-full rounded-lg border px-4 py-3 mb-4 shadow-md border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
                >
                    <div className="flex gap-3 items-start">
                        <AlertTriangle className='h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0' />
                        <div className="flex-1 space-y-1">
                            <div className="font-semibold text-sm leading-none tracking-tight">{t('admin.error_title')}</div>
                            <div className="text-sm opacity-90">{flash.error}</div>
                        </div>
                    </div>
                </div>
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
                    <div 
                        role="alert"
                        className="relative w-full rounded-lg border px-4 py-3 mb-4 shadow-md hover:shadow-lg transition-shadow cursor-pointer border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-200"
                    >
                        <div className="flex gap-3 items-start">
                            <BellDot className='h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0' />
                            <div className="flex-1 space-y-1">
                                <div className="font-semibold text-sm leading-none tracking-tight">{t('admin.new_password_change_request')}</div>
                                <div className="text-sm opacity-90">
                                    {t('admin.new_password_request_message', {name: newRequest.member.name})}
                                </div>
                            </div>
                        </div>
                    </div>
                </button>
            )}
        </div>
    );
};
