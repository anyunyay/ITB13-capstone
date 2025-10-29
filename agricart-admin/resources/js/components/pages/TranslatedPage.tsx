import React from 'react';
import { Head } from '@inertiajs/react';
import { useTranslation } from '@/hooks/useTranslation';
import { SmartButton } from '@/components/ui/smart-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ArrowLeft, Plus, Download, Upload, Filter, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
    labelKey: string;
    href?: string;
}

interface PageAction {
    key: string;
    labelKey: string;
    icon?: React.ComponentType<any>;
    variant?: 'default' | 'outline' | 'secondary' | 'destructive';
    onClick: () => void;
}

interface TranslatedPageProps {
    title?: string;
    titleKey?: string;
    description?: string;
    descriptionKey?: string;
    breadcrumbs?: BreadcrumbItem[];
    actions?: PageAction[];
    showBackButton?: boolean;
    onBack?: () => void;
    children: React.ReactNode;
    className?: string;
}

/**
 * Page wrapper component with full translation support
 * Provides consistent page structure with translated headers, breadcrumbs, and actions
 */
export function TranslatedPage({
    title,
    titleKey,
    description,
    descriptionKey,
    breadcrumbs = [],
    actions = [],
    showBackButton = false,
    onBack,
    children,
    className
}: TranslatedPageProps) {
    const { t } = useTranslation();

    const translatedTitle = titleKey ? t(titleKey, title) : title;
    const translatedDescription = descriptionKey ? t(descriptionKey, description) : description;

    return (
        <>
            {translatedTitle && <Head title={translatedTitle} />}
            
            <div className={cn('space-y-6', className)}>
                {/* Breadcrumbs */}
                {breadcrumbs.length > 0 && (
                    <Breadcrumb>
                        <BreadcrumbList>
                            {breadcrumbs.map((item, index) => (
                                <React.Fragment key={index}>
                                    <BreadcrumbItem>
                                        {item.href ? (
                                            <BreadcrumbLink href={item.href}>
                                                {t(item.labelKey)}
                                            </BreadcrumbLink>
                                        ) : (
                                            <BreadcrumbPage>{t(item.labelKey)}</BreadcrumbPage>
                                        )}
                                    </BreadcrumbItem>
                                    {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                                </React.Fragment>
                            ))}
                        </BreadcrumbList>
                    </Breadcrumb>
                )}

                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {showBackButton && (
                            <SmartButton
                                variant="outline"
                                size="sm"
                                onClick={onBack}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </SmartButton>
                        )}
                        
                        <div>
                            {translatedTitle && (
                                <h1 className="text-3xl font-bold tracking-tight">{translatedTitle}</h1>
                            )}
                            {translatedDescription && (
                                <p className="text-muted-foreground mt-2">{translatedDescription}</p>
                            )}
                        </div>
                    </div>

                    {/* Page Actions */}
                    {actions.length > 0 && (
                        <div className="flex gap-2">
                            {actions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <SmartButton
                                        key={action.key}
                                        variant={action.variant || 'default'}
                                        onClick={action.onClick}
                                    >
                                        {Icon && <Icon className="h-4 w-4 mr-2" />}
                                        {t(action.labelKey)}
                                    </SmartButton>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Page Content */}
                <div className="space-y-6">
                    {children}
                </div>
            </div>
        </>
    );
}

/**
 * Common page actions with predefined icons and translations
 */
export const commonPageActions = {
    add: (onClick: () => void): PageAction => ({
        key: 'add',
        labelKey: 'common.add',
        icon: Plus,
        onClick
    }),
    
    export: (onClick: () => void): PageAction => ({
        key: 'export',
        labelKey: 'common.export',
        icon: Download,
        variant: 'outline' as const,
        onClick
    }),
    
    import: (onClick: () => void): PageAction => ({
        key: 'import',
        labelKey: 'common.import',
        icon: Upload,
        variant: 'outline' as const,
        onClick
    }),
    
    filter: (onClick: () => void): PageAction => ({
        key: 'filter',
        labelKey: 'common.filter',
        icon: Filter,
        variant: 'outline' as const,
        onClick
    }),
    
    search: (onClick: () => void): PageAction => ({
        key: 'search',
        labelKey: 'common.search',
        icon: Search,
        variant: 'outline' as const,
        onClick
    })
};

/**
 * Translated card wrapper for page sections
 */
interface TranslatedCardProps {
    title?: string;
    titleKey?: string;
    description?: string;
    descriptionKey?: string;
    children: React.ReactNode;
    className?: string;
}

export function TranslatedCard({
    title,
    titleKey,
    description,
    descriptionKey,
    children,
    className
}: TranslatedCardProps) {
    const { t } = useTranslation();

    const translatedTitle = titleKey ? t(titleKey, title) : title;
    const translatedDescription = descriptionKey ? t(descriptionKey, description) : description;

    return (
        <Card className={className}>
            {(translatedTitle || translatedDescription) && (
                <CardHeader>
                    {translatedTitle && <CardTitle>{translatedTitle}</CardTitle>}
                    {translatedDescription && (
                        <p className="text-muted-foreground">{translatedDescription}</p>
                    )}
                </CardHeader>
            )}
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
}