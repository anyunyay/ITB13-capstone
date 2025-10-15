import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { PasswordChangeRequest } from '../../types/membership';
import styles from '../../pages/Admin/Membership/membership.module.css';

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
        <div className={styles.passwordRequestsSection}>
            <div className={styles.sectionHeader}>
                <div className={styles.sectionTitleContainer}>
                    <div className={styles.sectionIcon}>
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className={styles.sectionTitle}>Pending Password Change Requests</h2>
                        <p className={styles.sectionSubtitle}>
                            Review and approve member password change requests
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                {pendingPasswordRequests.map((request) => (
                    <div key={request.id} className={styles.passwordRequestCard}>
                        <div className={styles.passwordRequestHeader}>
                            <div className={styles.passwordRequestInfo}>
                                <div className={styles.passwordRequestName}>
                                    {request.member.name}
                                </div>
                                <div className={styles.passwordRequestDetails}>
                                    Member ID: {request.member.member_id}
                                </div>
                                <div className={styles.passwordRequestTime}>
                                    Requested: {new Date(request.requested_at).toLocaleString()}
                                </div>
                                {request.admin_notes && (
                                    <div className={styles.passwordRequestTime}>
                                        Notes: {request.admin_notes}
                                    </div>
                                )}
                            </div>
                            <div className={styles.passwordRequestActions}>
                                <Button
                                    onClick={() => onApprove(request)}
                                    disabled={processing}
                                    className={styles.approveButton}
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Approve
                                </Button>
                                <Button
                                    onClick={() => onReject(request)}
                                    disabled={processing}
                                    className={styles.rejectButton}
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
