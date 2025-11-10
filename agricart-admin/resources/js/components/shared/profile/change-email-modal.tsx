import { useState } from 'react';
import OtpVerificationModal from '@/components/shared/auth/otp-verification-modal';

interface User {
    id: number;
    name: string;
    email: string;
    type: string;
    phone?: string;
    contact_number?: string;
    avatar?: string;
    avatar_url?: string;
}

interface EmailChangeRequest {
    id: number;
    new_email: string;
    expires_at: string;
}

interface EmailChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    emailChangeRequest?: EmailChangeRequest;
}

export default function EmailChangeModal({ isOpen, onClose, user, emailChangeRequest }: EmailChangeModalProps) {
    // Get the appropriate API endpoint based on user type
    const getApiEndpoint = () => {
        const userType = user.type;
        let userTypePrefix = '';
        
        if (userType === 'admin' || userType === 'staff') {
            userTypePrefix = '/admin';
        } else if (userType === 'customer') {
            userTypePrefix = '/customer';
        } else if (userType === 'logistic') {
            userTypePrefix = '/logistic';
        } else if (userType === 'member') {
            userTypePrefix = '/member';
        } else {
            userTypePrefix = '/customer'; // fallback
        }
        
        return `${userTypePrefix}/profile/email-change`;
    };

    return (
        <OtpVerificationModal
            isOpen={isOpen}
            onClose={onClose}
            user={user}
            otpRequest={emailChangeRequest}
            verificationType="email"
            currentValue={user.email}
            newValueFieldName="new_email"
            apiEndpoint={getApiEndpoint()}
        />
    );
}
