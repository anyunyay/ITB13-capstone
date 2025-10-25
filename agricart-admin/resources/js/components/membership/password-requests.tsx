import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { PasswordChangeRequest } from '../../types/membership';

interface PasswordRequestsProps {
    pendingPasswordRequests: PasswordChangeRequest[];
    processing: boolean;
    onApprove: (request: PasswordChangeRequest) => void;
    onReject: (request: PasswordChangeRequest) => void;
}

export const PasswordRequests = ({
    pendingPasswordRequests,
    processing,
    onApprove,
    onReject
}: PasswordRequestsProps) => {
    if (!pendingPasswordRequests || pendingPasswordRequests.length === 0) {
        return null;
    }

    return (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 shadow-sm">
            <div className="flex flex-col gap-3 mb-4 pb-3 border-b border-border md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-primary/10 text-primary p-3 rounded-lg flex items-center justify-center">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-semibold text-foreground m-0 mb-1">Pending Password Change Requests</h2>
                        <p className="text-sm text-muted-foreground m-0">
                            Review and approve member password change requests
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {pendingPasswordRequests.map((request) => (
                    <div key={request.id} className="bg-background border border-border rounded-lg p-3 mb-2 transition-all duration-200 hover:border-primary hover:shadow-md">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                                <div className="font-semibold text-foreground mb-1">
                                    {request.member.name}
                                </div>
                                <div className="text-sm text-muted-foreground mb-1">
                                    Member ID: {request.member.member_id}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Requested: {new Date(request.requested_at).toLocaleString()}
                                </div>
                                {request.admin_notes && (
                                    <div className="text-xs text-muted-foreground">
                                        Notes: {request.admin_notes}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => onApprove(request)}
                                    disabled={processing}
                                    className="bg-green-600 text-white border-0 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:bg-green-700 hover:-translate-y-0.5 hover:shadow-lg"
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Approve
                                </Button>
                                <Button
                                    onClick={() => onReject(request)}
                                    disabled={processing}
                                    className="bg-destructive text-destructive-foreground border-0 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2 hover:bg-destructive/90 hover:-translate-y-0.5 hover:shadow-lg"
                                >
                                    <XCircle className="h-4 w-4" />
                                    Reject
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
