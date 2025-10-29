import React from 'react';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/useTranslation';

interface SmartLabelProps extends Omit<React.ComponentProps<typeof Label>, 'children'> {
    children?: React.ReactNode;
    autoTranslate?: boolean;
}

/**
 * Smart Label that automatically translates common label text
 * Usage: <SmartLabel>Name</SmartLabel> - automatically translates "Name"
 */
export function SmartLabel({ 
    children, 
    autoTranslate = true,
    ...props 
}: SmartLabelProps) {
    const { auto } = useTranslation();
    
    const translatedChildren = React.useMemo(() => {
        if (!autoTranslate || typeof children !== 'string') {
            return children;
        }
        return auto(children);
    }, [children, autoTranslate, auto]);
    
    return (
        <Label {...props}>
            {translatedChildren}
        </Label>
    );
}