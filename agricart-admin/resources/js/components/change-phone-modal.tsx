import { useState } from 'react';
import OtpVerificationModal from './otp-verification-modal';

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

interface PhoneChangeRequest {
    id: number;
    new_phone: string;
    expires_at: string;
}

interface PhoneChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    phoneChangeRequest?: PhoneChangeRequest;
}

export default function PhoneChangeModal({ isOpen, onClose, user, phoneChangeRequest }: PhoneChangeModalProps) {
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
        
        return `${userTypePrefix}/profile/phone-change`;
    };

    return (
        <OtpVerificationModal
            isOpen={isOpen}
            onClose={onClose}
            user={user}
            otpRequest={phoneChangeRequest}
            verificationType="phone"
            currentValue={user.contact_number || user.phone || ''}
            newValueFieldName="new_phone"
            apiEndpoint={getApiEndpoint()}
        />
    );
}

