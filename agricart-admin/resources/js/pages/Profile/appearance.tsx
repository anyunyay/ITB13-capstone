import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePage, Link } from '@inertiajs/react';
import { Sun, Moon, Monitor, Palette, Check, Languages, ArrowLeft } from 'lucide-react';
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
        // Admin/Staff/Logistic/Member Design - Matching Profile Page Pattern
        <div className="space-y-2">
            {/* Success/Error Message */}
            {message && (
                <div className={cn(
                    "p-4 rounded-lg border mb-4",
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
            <Card className="gap-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-green-500/10">
                            <Palette className="h-5 w-5 text-green-600" />
                        </div>
                        {t('appearance.theme.title')}
                    </CardTitle>
                    <CardDescription>
                        {t('appearance.theme.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-3">
                        {appearanceOptions.map((option) => {
                            const Icon = option.icon;
                            const isSelected = appearance === option.value;
                            
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleAppearanceChange(option.value)}
                                    disabled={isLoading}
                                    className={cn(
                                        "w-full p-4 rounded-lg border border-border transition-all text-left",
                                        "hover:border-primary/50 hover:bg-muted/50",
                                        isSelected && "bg-primary/5 border-primary"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "p-1.5 rounded-md",
                                            isSelected 
                                                ? "bg-primary/10" 
                                                : "bg-muted"
                                        )}>
                                            <Icon className={cn(
                                                "h-4 w-4",
                                                isSelected ? "text-primary" : "text-muted-foreground"
                                            )} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-sm text-foreground">{option.label}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">
                                                {option.description}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Current Selection Info */}
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Monitor className="h-3 w-3" />
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
            <Card className="gap-2">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-blue-500/10">
                            <Languages className="h-5 w-5 text-blue-600" />
                        </div>
                        {t('appearance.language.title')}
                    </CardTitle>
                    <CardDescription>
                        {t('appearance.language.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-3">
                        <div className="p-4 bg-muted/50 rounded-lg border border-border">
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
                        </div>

                        {/* Current Selection Info */}
                        <div className="p-4 bg-muted/50 rounded-lg border border-border">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Languages className="h-3 w-3" />
                                <span>
                                    {t('appearance.language.current_selection')}: <strong className="text-foreground">
                                        {language === 'en' ? t('appearance.language.english') : t('appearance.language.tagalog')}
                                    </strong>
                                </span>
                            </div>
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
                    <div className="bg-background">
                        <div className="w-full flex flex-col gap-2 px-2 py-2 sm:px-4 sm:py-4 lg:px-8 pb-8">
                            {/* Page Header */}
                            <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-3 sm:p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2 sm:p-2.5 rounded-lg flex items-center justify-center">
                                        <Palette className="h-4 w-4 sm:h-6 sm:w-6" />
                                    </div>
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight m-0">
                                            {t('appearance.title')}
                                        </h1>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                                            {t('appearance.theme.description')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {pageContent}
                        </div>
                    </div>
                </AppSidebarLayout>
            );
        case 'customer':
            return (
                <AppHeaderLayout>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16 sm:mt-20">
                        <div className="mb-8">
                            <div className="flex items-start gap-3 sm:gap-4 mb-4">
                                <div className="flex-1 min-w-0">
                                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                                        {t('appearance.title')}
                                    </h1>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {t('appearance.theme.description')}
                                    </p>
                                </div>
                                <Link href="/customer/home">
                                    <Button variant="outline" size="icon" className="sm:w-auto sm:px-4 shrink-0">
                                        <ArrowLeft className="h-4 w-4 sm:mr-2" />
                                        <span className="hidden sm:inline">{t('ui.back')}</span>
                                    </Button>
                                </Link>
                            </div>
                        </div>
                        {pageContent}
                    </div>
                </AppHeaderLayout>
            );
        case 'logistic':
            return (
                <LogisticLayout>
                    <div className="bg-background">
                        <div className="w-full flex flex-col gap-2 px-2 pt-22 py-2 lg:px-8 lg:pt-25 pb-8">
                            {/* Page Header */}
                            <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-3 sm:p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2 sm:p-2.5 rounded-lg flex items-center justify-center shrink-0">
                                        <Palette className="h-4 w-4 sm:h-6 sm:w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight m-0">
                                            {t('appearance.title')}
                                        </h1>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                                            {t('appearance.theme.description')}
                                        </p>
                                    </div>
                                    <Link href="/logistic/dashboard">
                                        <Button variant="outline" size="icon" className="sm:w-auto sm:px-4 shrink-0">
                                            <ArrowLeft className="h-4 w-4 sm:mr-2" />
                                            <span className="hidden sm:inline">{t('logistic.back_to_dashboard')}</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            {pageContent}
                        </div>
                    </div>
                </LogisticLayout>
            );
        case 'member':
            return (
                <MemberLayout>
                    <div className="bg-background">
                        <div className="w-full flex flex-col gap-2 px-2 pt-15 py-2 lg:px-8 lg:pt-17 pb-8">
                            {/* Page Header */}
                            <div className="bg-gradient-to-br from-card to-[color-mix(in_srgb,var(--card)_95%,var(--primary)_5%)] border border-border rounded-[0.8rem] p-3 sm:p-5 mb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="h-8 w-8 sm:h-10 sm:w-10 text-primary bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] p-2 sm:p-2.5 rounded-lg flex items-center justify-center shrink-0">
                                        <Palette className="h-4 w-4 sm:h-6 sm:w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-xl sm:text-2xl font-bold text-foreground leading-tight m-0">
                                            {t('appearance.title')}
                                        </h1>
                                        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 mb-0 leading-snug">
                                            {t('appearance.theme.description')}
                                        </p>
                                    </div>
                                    <Link href="/member/dashboard">
                                        <Button variant="outline" size="icon" className="sm:w-auto sm:px-4 shrink-0">
                                            <ArrowLeft className="h-4 w-4 sm:mr-2" />
                                            <span className="hidden sm:inline">{t('member.back_to_dashboard')}</span>
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            {pageContent}
                        </div>
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
