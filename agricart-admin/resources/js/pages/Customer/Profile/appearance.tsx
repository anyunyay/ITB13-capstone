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
                alert('Appearance settings saved successfully!');
            },
            onError: () => {
                alert('Failed to save appearance settings. Please try again.');
            },
        });
    };

    const languages = [
        { code: 'en', name: 'English', flag: '🇺🇸' },
        { code: 'fil', name: 'Filipino', flag: '🇵🇭' },
        { code: 'es', name: 'Spanish', flag: '🇪🇸' },
        { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
        { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
        { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    ];

    return (
        <AppHeaderLayout breadcrumbs={[
            { label: 'Appearance Settings', href: '/customer/profile/appearance' }
        ]}>
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">Appearance Settings</h2>
                </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        Theme & Display
                    </CardTitle>
                    <CardDescription>
                        Customize the appearance of your interface
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Theme Preference</Label>
                            <div className="grid grid-cols-3 gap-3">
                                <Button
                                    variant={data.theme === 'light' ? 'default' : 'outline'}
                                    onClick={() => handleThemeChange('light')}
                                    className="flex flex-col items-center gap-2 h-auto py-4"
                                >
                                    <Sun className="h-5 w-5" />
                                    <span className="text-sm">Light</span>
                                </Button>
                                <Button
                                    variant={data.theme === 'dark' ? 'default' : 'outline'}
                                    onClick={() => handleThemeChange('dark')}
                                    className="flex flex-col items-center gap-2 h-auto py-4"
                                >
                                    <Moon className="h-5 w-5" />
                                    <span className="text-sm">Dark</span>
                                </Button>
                                <Button
                                    variant={data.theme === 'system' ? 'default' : 'outline'}
                                    onClick={() => handleThemeChange('system')}
                                    className="flex flex-col items-center gap-2 h-auto py-4"
                                >
                                    <Monitor className="h-5 w-5" />
                                    <span className="text-sm">System</span>
                                </Button>
                            </div>
                            {data.theme === 'system' && (
                                <p className="text-sm text-gray-500">
                                    Currently using {systemTheme} theme based on your system preference
                                </p>
                            )}
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label htmlFor="language">Language</Label>
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
                        Notification Preferences
                    </CardTitle>
                    <CardDescription>
                        Choose how you want to receive notifications
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <Label htmlFor="email-notifications">Email Notifications</Label>
                                <p className="text-sm text-gray-500">
                                    Receive order updates and promotions via email
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
                                <Label htmlFor="push-notifications">Push Notifications</Label>
                                <p className="text-sm text-gray-500">
                                    Get instant notifications in your browser
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
                                <Label htmlFor="sms-notifications">SMS Notifications</Label>
                                <p className="text-sm text-gray-500">
                                    Receive important updates via text message
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
                    {processing ? 'Saving...' : 'Save Preferences'}
                </Button>
            </div>
        </div>
        </AppHeaderLayout>
    );
}
