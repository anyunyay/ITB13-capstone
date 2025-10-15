import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BellDot } from 'lucide-react';
import { PasswordChangeRequest } from '../../types/membership';

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
    return (
        <div className="space-y-4">
            {flash.message && (
                <Alert>
                    <BellDot className='h-4 w-4 text-blue-500' />
                    <AlertTitle>Notification!</AlertTitle>
                    <AlertDescription>{flash.message}</AlertDescription>
                </Alert>
            )}
            
            {flash.error && (
                <Alert className="border-red-300">
                    <BellDot className='h-4 w-4 text-red-500' />
                    <AlertTitle>Error!</AlertTitle>
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
                        <AlertTitle>New Password Change Request</AlertTitle>
                        <AlertDescription>
                            {newRequest.member.name} just submitted a password change request. Click to view member.
                        </AlertDescription>
                    </Alert>
                </button>
            )}
        </div>
    );
};
