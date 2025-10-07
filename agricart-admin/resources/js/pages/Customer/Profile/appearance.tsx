import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useForm, usePage } from '@inertiajs/react';
import { Palette, Sun, Moon, Monitor, Globe, Settings } from 'lucide-react';
import AppHeaderLayout from '@/layouts/app/app-header-layout';
import { t, Language } from '@/lib/translations';

interface PageProps {
    user: {
        id: number;
        name: string;
        email: string;
        theme?: 'light' | 'dark' | 'system';
        language?: string;
        notifications?: {
            email: boolean;
            push: boolean;
            sms: boolean;
        };
    };
}

export default function AppearancePage() {
    const { user } = usePage<PageProps>().props;
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
    const currentLanguage = (user?.language || 'en') as Language;

    const { data, setData, patch, processing, errors } = useForm({
        theme: user?.theme || 'system',
        language: user?.language || 'en',
        notifications: {
            email: user?.notifications?.email ?? true,
            push: user?.notifications?.push ?? true,
            sms: user?.notifications?.sms ?? false,
        },
    });

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

    const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
        setData('theme', theme);
        
        // Apply theme immediately for preview
        const root = document.documentElement;
        if (theme === 'system') {
            root.classList.remove('light', 'dark');
            root.classList.add(systemTheme);
        } else {
            root.classList.remove('light', 'dark');
            root.classList.add(theme);
        }
    };

    const handleNotificationChange = (type: 'email' | 'push' | 'sms', value: boolean) => {
        setData('notifications', {
            ...data.notifications,
            [type]: value,
        });
    };

    const handleSave = () => {
        patch('/customer/profile/appearance', {
            onSuccess: () => {
                alert(t(currentLanguage, 'appearance.messages.success'));
            },
            onError: () => {
                alert(t(currentLanguage, 'appearance.messages.error'));
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

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        {t(currentLanguage, 'appearance.notifications.title')}
                    </CardTitle>
                    <CardDescription>
                        {t(currentLanguage, 'appearance.notifications.description')}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label htmlFor="email-notifications">{t(currentLanguage, 'appearance.notifications.email.title')}</Label>
                                <p className="text-sm text-gray-500">
                                    {t(currentLanguage, 'appearance.notifications.email.description')}
                                </p>
                            </div>
                            <Switch
                                id="email-notifications"
                                checked={data.notifications.email}
                                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label htmlFor="push-notifications">{t(currentLanguage, 'appearance.notifications.push.title')}</Label>
                                <p className="text-sm text-gray-500">
                                    {t(currentLanguage, 'appearance.notifications.push.description')}
                                </p>
                            </div>
                            <Switch
                                id="push-notifications"
                                checked={data.notifications.push}
                                onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label htmlFor="sms-notifications">{t(currentLanguage, 'appearance.notifications.sms.title')}</Label>
                                <p className="text-sm text-gray-500">
                                    {t(currentLanguage, 'appearance.notifications.sms.description')}
                                </p>
                            </div>
                            <Switch
                                id="sms-notifications"
                                checked={data.notifications.sms}
                                onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={processing}>
                    {processing ? t(currentLanguage, 'appearance.actions.saving') : t(currentLanguage, 'appearance.actions.save')}
                </Button>
            </div>
        </div>
        </AppHeaderLayout>
    );
}
