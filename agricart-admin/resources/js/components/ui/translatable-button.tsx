import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { __ } from '@/lib/i18n';

interface TranslatableButtonProps extends Omit<ButtonProps, 'children'> {
    translationKey?: string;
    children?: React.ReactNode;
}

/**
 * A Button component that supports translation keys
 * Usage: <TranslatableButton translationKey="common.save" />
 * Or: <TranslatableButton>Custom text</TranslatableButton>
 */
export function TranslatableButton({ 
    translationKey, 
    children, 
    ...props 
}: TranslatableButtonProps) {
    const content = translationKey ? __(translationKey) : children;
    
    return (
        <Button {...props}>
            {content}
        </Button>
    );
}