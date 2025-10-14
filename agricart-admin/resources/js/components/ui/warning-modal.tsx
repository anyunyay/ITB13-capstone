import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface WarningModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    variant?: 'warning' | 'error' | 'info';
}

export function WarningModal({
    isOpen,
    onClose,
    title,
    message,
    confirmText = 'OK',
    cancelText = 'Cancel',
    onConfirm,
    variant = 'warning'
}: WarningModalProps) {
    const getIcon = () => {
        switch (variant) {
            case 'error':
                return <AlertTriangle className="h-6 w-6 text-red-500" />;
            case 'info':
                return <AlertTriangle className="h-6 w-6 text-blue-500" />;
            default:
                return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
        }
    };

    const getButtonVariant = () => {
        switch (variant) {
            case 'error':
                return 'destructive';
            case 'info':
                return 'default';
            default:
                return 'default';
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        {getIcon()}
                        {title}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-left">
                        {message}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose}>
                        {cancelText}
                    </AlertDialogCancel>
                    {onConfirm && (
                        <AlertDialogAction
                            onClick={onConfirm}
                            variant={getButtonVariant()}
                        >
                            {confirmText}
                        </AlertDialogAction>
                    )}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
