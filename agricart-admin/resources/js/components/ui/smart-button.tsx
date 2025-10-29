import React from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

interface SmartButtonProps extends Omit<React.ComponentProps<typeof Button>, 'children'> {
    children?: React.ReactNode;
    autoTranslate?: boolean;
}

/**
 * Smart Button that automatically translates common button text
 * Falls back to original text if no translation available
 * Usage: <SmartButton>Save</SmartButton> - automatically translates "Save"
 * Usage: <SmartButton autoTranslate={false}>Custom Text</SmartButton> - skips translation
 */
export function SmartButton({ 
    children, 
    autoTranslate = true,
    ...props 
}: SmartButtonProps) {
    const { auto } = useTranslation();
    
    // Auto-translate text content if it's a string and autoTranslate is enabled
    const translatedChildren = React.useMemo(() => {
        if (!autoTranslate || typeof children !== 'string') {
            return children;
        }
        return auto(children);
    }, [children, autoTranslate, auto]);
    
    return (
        <Button {...props}>
            {translatedChildren}
        </Button>
    );
}