import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { SmartButton } from '@/components/ui/smart-button';
import { SmartLabel } from '@/components/ui/smart-label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FormField {
    key: string;
    type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'file';
    labelKey: string;
    placeholderKey?: string;
    required?: boolean;
    options?: { value: string; labelKey: string }[];
    validation?: {
        min?: number;
        max?: number;
        pattern?: string;
    };
}

interface TranslatedFormProps {
    title?: string;
    titleKey?: string;
    description?: string;
    descriptionKey?: string;
    fields: FormField[];
    data: Record<string, any>;
    errors?: Record<string, string>;
    processing?: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onChange: (key: string, value: any) => void;
    submitButtonKey?: string;
    cancelButtonKey?: string;
    onCancel?: () => void;
    className?: string;
}

/**
 * Form component with full translation support
 * Automatically translates labels, placeholders, and validation messages
 */
export function TranslatedForm({
    title,
    titleKey,
    description,
    descriptionKey,
    fields,
    data,
    errors = {},
    processing = false,
    onSubmit,
    onChange,
    submitButtonKey = 'common.submit',
    cancelButtonKey = 'common.cancel',
    onCancel,
    className
}: TranslatedFormProps) {
    const { t } = useTranslation();

    const translatedTitle = titleKey ? t(titleKey, title) : title;
    const translatedDescription = descriptionKey ? t(descriptionKey, description) : description;

    return (
        <Card className={cn('w-full', className)}>
            {(translatedTitle || translatedDescription) && (
                <CardHeader>
                    {translatedTitle && (
                        <CardTitle>{translatedTitle}</CardTitle>
                    )}
                    {translatedDescription && (
                        <p className="text-muted-foreground">{translatedDescription}</p>
                    )}
                </CardHeader>
            )}
            
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-6">
                    {fields.map((field) => (
                        <div key={field.key} className="space-y-2">
                            <SmartLabel htmlFor={field.key}>
                                {t(field.labelKey)}
                                {field.required && <span className="text-destructive ml-1">*</span>}
                            </SmartLabel>
                            
                            {renderFormField(field, data[field.key], onChange, t, errors[field.key])}
                            
                            {errors[field.key] && (
                                <p className="text-sm text-destructive">{errors[field.key]}</p>
                            )}
                        </div>
                    ))}
                    
                    <div className="flex gap-4 pt-4">
                        <SmartButton
                            type="submit"
                            disabled={processing}
                            className="flex-1"
                        >
                            {processing ? t('common.loading', 'Loading...') : t(submitButtonKey)}
                        </SmartButton>
                        
                        {onCancel && (
                            <SmartButton
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={processing}
                            >
                                {t(cancelButtonKey)}
                            </SmartButton>
                        )}
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

/**
 * Render individual form field based on type
 */
function renderFormField(
    field: FormField,
    value: any,
    onChange: (key: string, value: any) => void,
    t: (key: string, fallback?: string) => string,
    error?: string
): React.ReactNode {
    const placeholder = field.placeholderKey ? t(field.placeholderKey) : undefined;
    const hasError = !!error;

    switch (field.type) {
        case 'textarea':
            return (
                <Textarea
                    id={field.key}
                    value={value || ''}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    placeholder={placeholder}
                    required={field.required}
                    className={cn(hasError && 'border-destructive')}
                />
            );

        case 'select':
            return (
                <Select
                    value={value || ''}
                    onValueChange={(newValue) => onChange(field.key, newValue)}
                >
                    <SelectTrigger className={cn(hasError && 'border-destructive')}>
                        <SelectValue placeholder={placeholder || t('forms.select_option', 'Select an option')} />
                    </SelectTrigger>
                    <SelectContent>
                        {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {t(option.labelKey)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );

        case 'file':
            return (
                <Input
                    id={field.key}
                    type="file"
                    onChange={(e) => onChange(field.key, e.target.files?.[0])}
                    required={field.required}
                    className={cn(hasError && 'border-destructive')}
                />
            );

        default:
            return (
                <Input
                    id={field.key}
                    type={field.type}
                    value={value || ''}
                    onChange={(e) => onChange(field.key, e.target.value)}
                    placeholder={placeholder}
                    required={field.required}
                    min={field.validation?.min}
                    max={field.validation?.max}
                    pattern={field.validation?.pattern}
                    className={cn(hasError && 'border-destructive')}
                />
            );
    }
}