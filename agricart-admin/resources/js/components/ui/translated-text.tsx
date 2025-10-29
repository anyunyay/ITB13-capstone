import React from 'react';
import { __ } from '@/lib/i18n';

interface TranslatedTextProps {
    translationKey: string;
    fallback?: string;
    className?: string;
    as?: keyof JSX.IntrinsicElements;
    children?: never;
}

/**
 * A component that renders translated text based on the current language
 * Usage: <TranslatedText translationKey="common.save" />
 */
export function TranslatedText({ 
    translationKey, 
    fallback, 
    className, 
    as: Component = 'span' 
}: TranslatedTextProps) {
    const translatedText = __(translationKey) || fallback || translationKey;
    
    return (
        <Component className={className}>
            {translatedText}
        </Component>
    );
}

// Shorthand component
export const T = TranslatedText;