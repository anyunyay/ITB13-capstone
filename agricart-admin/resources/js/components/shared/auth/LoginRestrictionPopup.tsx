import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface LoginRestrictionPopupProps {
    isOpen: boolean;
    userType: string;
    targetPortal: string;
    redirectDelay?: number;
}

export default function LoginRestrictionPopup({
    isOpen,
    userType,
    targetPortal,
    redirectDelay = 2000
}: LoginRestrictionPopupProps) {
    useEffect(() => {
        if (isOpen) {
            const getCorrectLoginUrl = (userType: string) => {
                const urls: Record<string, string> = {
                    'customer': '/login',
                    'admin': '/admin/login',
                    'staff': '/admin/login',
                    'member': '/member/login',
                    'logistic': '/logistic/login'
                };
                return urls[userType] || '/login';
            };

            const timer = setTimeout(() => {
                window.location.href = getCorrectLoginUrl(userType);
            }, redirectDelay);

            return () => clearTimeout(timer);
        }
    }, [isOpen, userType, redirectDelay]);

    if (!isOpen) return null;

    const getUserTypeDisplayName = (type: string) => {
        const names: Record<string, string> = {
            'customer': 'Customer',
            'admin': 'Admin',
            'staff': 'Staff',
            'member': 'Member',
            'logistic': 'Logistics'
        };
        return names[type] || type;
    };

    const getPortalDisplayName = (portal: string) => {
        const names: Record<string, string> = {
            'customer': 'Customer Portal',
            'admin': 'Admin Portal',
            'member': 'Member Portal',
            'logistic': 'Logistics Portal'
        };
        return names[portal] || portal;
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-sm bg-gray-900 border-gray-700 shadow-2xl">
                <CardContent className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/20 mb-4">
                        <AlertTriangle className="h-6 w-6 text-red-400" />
                    </div>
                    
                    <p className="text-gray-100 font-medium mb-2 text-sm leading-tight">
                        {getUserTypeDisplayName(userType)} accounts cannot access<br />
                        {getPortalDisplayName(targetPortal)}
                    </p>
                    
                    <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs">
                        <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse"></div>
                            <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span>Redirecting...</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
