import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BellDot } from 'lucide-react';
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
        <div className="space-y-4">
            {flash.message && (
                <Alert>
                    <BellDot className='h-4 w-4 text-blue-500' />
                    <AlertTitle>{t('admin.notification')}</AlertTitle>
                    <AlertDescription>{flash.message}</AlertDescription>
                </Alert>
            )}
            
            {flash.error && (
                <Alert className="border-red-300">
                    <BellDot className='h-4 w-4 text-red-500' />
                    <AlertTitle>{t('admin.error_title')}</AlertTitle>
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
                    <Alert className="cursor-pointer border-green-300">
                        <BellDot className='h-4 w-4 text-green-600' />
                        <AlertTitle>{t('admin.new_password_change_request')}</AlertTitle>
                        <AlertDescription>
                            {t('admin.new_password_request_message', {name: newRequest.member.name})}
                        </AlertDescription>
                    </Alert>
                </button>
            )}
        </div>
    );
};
