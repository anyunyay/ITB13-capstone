import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePage } from '@inertiajs/react';
import { Sun, Moon, Monitor, Palette, Check, Languages } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';
import { useLanguage } from '@/hooks/use-language';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import LogisticLayout from '@/layouts/logistic-layout';
import MemberLayout from '@/layouts/member-layout';

interface User {
    id: number;
    name: string;
    email: string;
    type: string;
    appearance?: string;
}

interface PageProps {
    user: User;
    [key: string]: any;
}

type Appearance = 'light' | 'dark' | 'system';

export default function AppearancePage() {
    const { user } = usePage<PageProps>().props;
    const { appearance, updateAppearance } = useAppearance();
    const { language, updateLanguage, isLoading: isLanguageLoading } = useLanguage();
    const t = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Get translated appearance options
    const appearanceOptions: { value: Appearance; label: string; description: string; icon: any }[] = [
        {
            value: 'light',
            label: t('appearance.theme.light'),
            description: t('appearance.theme.light_description'),
            icon: Sun,
        },
        {
            value: 'dark',
            label: t('appearance.theme.dark'),
            description: t('appearance.theme.dark_description'),
            icon: Moon,
        },
        {
            value: 'system',
            label: t('appearance.theme.system'),
            description: t('appearance.theme.system_description'),
            icon: Monitor,
        },
    ];

    const handleAppearanceChange = async (newAppearance: Appearance) => {
        try {
            setIsLoading(true);
            setMessage(null);
            
            // Update appearance using the built-in hook
            updateAppearance(newAppearance);
            
            // Show success message
            setMessage({ type: 'success', text: t('appearance.messages.appearance_success') });
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
            
        } catch (error) {
            console.error('Failed to update appearance:', error);
            setMessage({ type: 'error', text: t('appearance.messages.appearance_error') });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLanguageChange = async (newLanguage: 'en' | 'tl') => {
        try {
            setIsLoading(true);
            setMessage(null);
            
            // Update language using the hook
            await updateLanguage(newLanguage);
            
            // Show success message
            setMessage({ type: 'success', text: t('appearance.messages.language_success') });
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
            
        } catch (error) {
            console.error('Failed to update language:', error);
            setMessage({ type: 'error', text: t('appearance.messages.language_error') });
        } finally {
            setIsLoading(false);
        }
    };

    // Appearance page content
    const pageContent = user.type === 'customer' ? (
        // Customer Design - Clean & Modern
        <div className="space-y-8">
            {/* Success/Error Message */}
            {message && (
                <div className={cn(
                    "p-4 rounded-2xl border-2 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300",
                    message.type === 'success' 
                        ? "bg-green-50 border-green-300 text-green-900 dark:bg-green-950/30 dark:border-green-700 dark:text-green-100"
                        : "bg-red-50 border-red-300 text-red-900 dark:bg-red-950/30 dark:border-red-700 dark:text-red-100"
                )}>
                    <div className="flex items-center gap-3">
                        <Check className="h-5 w-5" />
                        <span className="font-medium">{message.text}</span>
                    </div>
                </div>
            )}

            {/* Theme Selection - Customer Design */}
            <Card className="border-2 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 pb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Palette className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">{t('appearance.theme.title')}</CardTitle>
                            <CardDescription className="text-base mt-1">
                                {t('appearance.theme.description')}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="grid gap-4">
                        {appearanceOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = appearance === option.value;
                            
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleAppearanceChange(option.value)}
                                    disabled={isLoading}
                                    className={cn(
                                        "relative p-6 rounded-2xl border-2 transition-all duration-300 text-left group",
                                        "hover:scale-[1.02] hover:shadow-lg",
                                        isSelected 
                                            ? "bg-primary border-primary shadow-lg shadow-primary/20" 
                                            : "bg-card border-border hover:border-primary/50"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "p-3 rounded-xl transition-colors",
                                            isSelected 
                                                ? "bg-white/20" 
                                                : "bg-primary/10 group-hover:bg-primary/20"
                                        )}>
                                            <Icon className={cn(
                                                "h-6 w-6",
                                                isSelected ? "text-white" : "text-primary"
                                            )} />
                                        </div>
                                        <div className="flex-1">
                                            <div className={cn(
                                                "font-semibold text-lg mb-1",
                                                isSelected ? "text-white" : "text-foreground"
                                            )}>
                                                {option.label}
                                            </div>
                                            <div className={cn(
                                                "text-sm",
                                                isSelected ? "text-white/80" : "text-muted-foreground"
                                            )}>
                                                {option.description}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div className="flex-shrink-0">
                                                <div className="p-1 bg-white/20 rounded-full">
                                                    <Check className="h-6 w-6 text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Language Selection - Customer Design */}
            <Card className="border-2 shadow-xl rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-br from-secondary/5 via-secondary/10 to-secondary/5 pb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-secondary/10 rounded-2xl">
                            <Languages className="h-7 w-7 text-secondary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">{t('appearance.language.title')}</CardTitle>
                            <CardDescription className="text-base mt-1">
                                {t('appearance.language.description')}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-3">
                        <label htmlFor="language-select" className="text-sm font-semibold text-foreground">
                            {t('appearance.language.select_language')}
                        </label>
                        <Select
                            value={language}
                            onValueChange={(value: 'en' | 'tl') => handleLanguageChange(value)}
                            disabled={isLoading || isLanguageLoading}
                        >
                            <SelectTrigger id="language-select" className="h-14 text-base rounded-xl border-2">
                                <SelectValue placeholder={t('appearance.language.select_language')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en" className="text-base py-3">{t('appearance.language.english')}</SelectItem>
                                <SelectItem value="tl" className="text-base py-3">{t('appearance.language.tagalog')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
    ) : (
        // Admin/Staff/Logistic/Member Design - Professional & Compact
        <div className="space-y-6">
            {/* Success/Error Message */}
            {message && (
                <div className={cn(
                    "p-4 rounded-lg border",
                    message.type === 'success' 
                        ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
                        : "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300"
                )}>
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        {message.text}
                    </div>
                </div>
            )}

            {/* Appearance Settings Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Palette className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <CardTitle className="text-green-600 dark:text-green-400">
                                {t('appearance.theme.title')}
                            </CardTitle>
                            <CardDescription>
                                {t('appearance.theme.description')}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-3">
                        {appearanceOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = appearance === option.value;
                            
                            return (
                                <Button
                                    key={option.value}
                                    variant={isSelected ? "default" : "outline"}
                                    className={cn(
                                        "h-auto p-4 justify-start text-left",
                                        isSelected 
                                            ? "bg-green-600 hover:bg-green-700 text-white border-green-600" 
                                            : "hover:bg-green-50 dark:hover:bg-green-900/20 border-green-200 dark:border-green-800"
                                    )}
                                    onClick={() => handleAppearanceChange(option.value)}
                                    disabled={isLoading}
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        <div className={cn(
                                            "p-2 rounded-lg",
                                            isSelected 
                                                ? "bg-white/20" 
                                                : "bg-green-100 dark:bg-green-900/30"
                                        )}>
                                            <Icon className={cn(
                                                "h-4 w-4",
                                                isSelected 
                                                    ? "text-white" 
                                                    : "text-green-600 dark:text-green-400"
                                            )} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium">{option.label}</div>
                                            <div className={cn(
                                                "text-sm",
                                                isSelected 
                                                    ? "text-white/80" 
                                                    : "text-muted-foreground"
                                            )}>
                                                {option.description}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <Check className="h-5 w-5 text-white" />
                                        )}
                                    </div>
                                </Button>
                            );
                        })}
                    </div>

                    {/* Current Selection Info */}
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Monitor className="h-4 w-4" />
                            <span>
                                {t('appearance.theme.current_selection')}: <strong className="text-foreground">
                                    {appearanceOptions.find(opt => opt.value === appearance)?.label}
                                </strong>
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Language Settings Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Languages className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <CardTitle className="text-green-600 dark:text-green-400">
                                {t('appearance.language.title')}
                            </CardTitle>
                            <CardDescription>
                                {t('appearance.language.description')}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="language-select" className="text-sm font-medium">
                            {t('appearance.language.select_language')}
                        </label>
                        <Select
                            value={language}
                            onValueChange={(value: 'en' | 'tl') => handleLanguageChange(value)}
                            disabled={isLoading || isLanguageLoading}
                        >
                            <SelectTrigger id="language-select" className="w-full">
                                <SelectValue placeholder={t('appearance.language.select_language')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">{t('appearance.language.english')}</SelectItem>
                                <SelectItem value="tl">{t('appearance.language.tagalog')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Current Selection Info */}
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Languages className="h-4 w-4" />
                            <span>
                                {t('appearance.language.current_selection')}: <strong className="text-foreground">
                                    {language === 'en' ? t('appearance.language.english') : t('appearance.language.tagalog')}
                                </strong>
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    // Render with appropriate layout based on user type
    switch (user?.type) {
        case 'admin':
        case 'staff':
            return (
                <AppSidebarLayout>
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {t('appearance.title')}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('appearance.theme.description')}
                            </p>
                        </div>
                        {pageContent}
                    </div>
                </AppSidebarLayout>
            );
        case 'customer':
            return (
                <AppHeaderLayout>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20">
                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {t('appearance.title')}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('appearance.theme.description')}
                            </p>
                        </div>
                        {pageContent}
                    </div>
                </AppHeaderLayout>
            );
        case 'logistic':
            return (
                <LogisticLayout>
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {t('appearance.title')}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('appearance.theme.description')}
                            </p>
                        </div>
                        {pageContent}
                    </div>
                </LogisticLayout>
            );
        case 'member':
            return (
                <MemberLayout>
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {t('appearance.title')}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('appearance.theme.description')}
                            </p>
                        </div>
                        {pageContent}
                    </div>
                </MemberLayout>
            );
        default:
            return (
                <AppHeaderLayout>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20">
                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                {t('appearance.title')}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {t('appearance.theme.description')}
                            </p>
                        </div>
                        {pageContent}
                    </div>
                </AppHeaderLayout>
            );
    }
}
