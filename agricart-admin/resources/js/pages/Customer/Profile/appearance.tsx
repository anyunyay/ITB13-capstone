import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useForm, usePage } from '@inertiajs/react';
import { Palette, Sun, Moon, Monitor, Globe } from 'lucide-react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { t, Language } from '@/lib/translations';
import { FlashMessage } from '@/components/flash-message';

interface PageProps {
    user: {
        id: number;
        name: string;
        email: string;
        theme?: 'light' | 'dark' | 'system';
        language?: string;
    };
    [key: string]: any;
}

export default function AppearancePage() {
    // Appearance settings page - notifications removed
    const { user } = usePage<PageProps>().props;
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
    const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const [initialValues, setInitialValues] = useState({
        theme: user?.theme || 'system',
        language: user?.language || 'en',
    });
    const currentLanguage = (user?.language || 'en') as Language;

    const { data, setData, patch, processing, errors } = useForm({
        theme: initialValues.theme,
        language: initialValues.language,
    });

    // Check if any changes have been made
    const hasChanges = data.theme !== initialValues.theme || data.language !== initialValues.language;

    // Detect system theme preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setSystemTheme(mediaQuery.matches ? 'dark' : 'light');

        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Apply initial theme on component mount
    useEffect(() => {
        const root = document.documentElement;
        const currentTheme = user?.theme || 'system';
        
        if (currentTheme === 'system') {
            root.classList.remove('light', 'dark');
            root.classList.add(systemTheme);
        } else {
            root.classList.remove('light', 'dark');
            root.classList.add(currentTheme);
        }
    }, [user?.theme, systemTheme]);

    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        setData('theme', theme);
    };

    const handleSave = () => {
        patch('/customer/profile/appearance', {
            onSuccess: () => {
                // Apply theme after successful save
                const root = document.documentElement;
                if (data.theme === 'system') {
                    root.classList.remove('light', 'dark');
                    root.classList.add(systemTheme);
                } else {
                    root.classList.remove('light', 'dark');
                    root.classList.add(data.theme);
                }
                setFlashMessage({
                    type: 'success',
                    message: t(currentLanguage, 'appearance.messages.success')
                });
                // Clear the flash message after 5 seconds
                setTimeout(() => setFlashMessage(null), 5000);
                
                // Update initial values to current values after successful save
                setInitialValues({
                    theme: data.theme,
                    language: data.language,
                });
            },
            onError: () => {
                setFlashMessage({
                    type: 'error',
                    message: t(currentLanguage, 'appearance.messages.error')
                });
                // Clear the flash message after 5 seconds
                setTimeout(() => setFlashMessage(null), 5000);
            },
        });
    };

    const languages = [
        { code: 'en', name: t(currentLanguage, 'appearance.language.english'), flag: '🇺🇸' },
        { code: 'fil', name: t(currentLanguage, 'appearance.language.tagalog'), flag: '🇵🇭' },
    ];

    return (
        <AppHeaderLayout breadcrumbs={[
            { label: t(currentLanguage, 'appearance.title'), href: '/customer/profile/appearance' }
        ]}>
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">{t(currentLanguage, 'appearance.title')}</h2>
                </div>

                {flashMessage && (
                    <div 
                        className="mb-4 cursor-pointer"
                        onClick={() => setFlashMessage(null)}
                    >
                        <FlashMessage 
                            flash={flashMessage} 
                        />
                    </div>
                )}

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        {t(currentLanguage, 'appearance.theme.title')}
                    </CardTitle>
                    <CardDescription>
                        {t(currentLanguage, 'appearance.theme.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t(currentLanguage, 'appearance.theme.preference')}</Label>
                            <div className="grid grid-cols-3 gap-3">
                                <Button
                                    variant={data.theme === 'light' ? 'default' : 'outline'}
                                    onClick={() => handleThemeChange('light')}
                                    className="flex flex-col items-center gap-2 h-auto py-4"
                                >
                                    <Sun className="h-5 w-5" />
                                    <span className="text-sm">{t(currentLanguage, 'appearance.theme.light')}</span>
                                </Button>
                                <Button
                                    variant={data.theme === 'dark' ? 'default' : 'outline'}
                                    onClick={() => handleThemeChange('dark')}
                                    className="flex flex-col items-center gap-2 h-auto py-4"
                                >
                                    <Moon className="h-5 w-5" />
                                    <span className="text-sm">{t(currentLanguage, 'appearance.theme.dark')}</span>
                                </Button>
                                <Button
                                    variant={data.theme === 'system' ? 'default' : 'outline'}
                                    onClick={() => handleThemeChange('system')}
                                    className="flex flex-col items-center gap-2 h-auto py-4"
                                >
                                    <Monitor className="h-5 w-5" />
                                    <span className="text-sm">{t(currentLanguage, 'appearance.theme.system')}</span>
                                </Button>
                            </div>
                            {data.theme === 'system' && (
                                <p className="text-sm text-gray-500">
                                    {t(currentLanguage, 'appearance.theme.systemDescription', { theme: systemTheme })}
                                </p>
                            )}
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label htmlFor="language">{t(currentLanguage, 'appearance.language.title')}</Label>
                            <Select value={data.language} onValueChange={(value) => setData('language', value)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.map((lang) => (
                                        <SelectItem key={lang.code} value={lang.code}>
                                            <div className="flex items-center gap-2">
                                                <span>{lang.flag}</span>
                                                <span>{lang.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={processing || !hasChanges}>
                    {processing ? t(currentLanguage, 'appearance.actions.saving') : t(currentLanguage, 'appearance.actions.save')}
                </Button>
            </div>
        </div>
        </AppHeaderLayout>
    );
}
