import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useForm, usePage } from '@inertiajs/react';
import { Palette, Sun, Moon, Monitor, Globe } from 'lucide-react';
import ProfileWrapper from './profile-wrapper';
import { t, Language } from '@/lib/translations';
import { FlashMessage } from '@/components/flash-message';

interface PageProps {
    user: {
        id: number;
        name: string;
        email: string;
        type: string;
        theme?: 'light' | 'dark' | 'system';
        language?: string;
    };
    [key: string]: any;
}

export default function AppearancePage() {
    // Appearance settings page - notifications removed
    const { user } = usePage<PageProps>().props;
    
    // Generate dynamic routes based on user type
    const getProfileRoutes = () => {
        const userType = user.type;
        const baseRoute = userType === 'customer' ? '/customer' : 
                         userType === 'admin' || userType === 'staff' ? '/admin' :
                         userType === 'logistic' ? '/logistic' :
                         userType === 'member' ? '/member' : '/customer';
        
        return {
            appearanceUpdate: `${baseRoute}/profile/appearance`,
            appearancePage: `${baseRoute}/profile/appearance`,
        };
    };

    const routes = getProfileRoutes();
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

    // Apply initial theme on component mount and sync with localStorage
    useEffect(() => {
        const root = document.documentElement;
        const currentTheme = user?.theme || 'system';
        
        // Sync server-side theme with localStorage
        const savedTheme = localStorage.getItem('appearance');
        if (currentTheme !== savedTheme) {
            localStorage.setItem('appearance', currentTheme);
            // Also set cookie for SSR
            const setCookie = (name: string, value: string, days = 365) => {
                const maxAge = days * 24 * 60 * 60;
                document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
            };
            setCookie('appearance', currentTheme);
        }
        
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
        patch(routes.appearanceUpdate, {
            onSuccess: () => {
                // Sync with localStorage and cookies for client-side persistence
                localStorage.setItem('appearance', data.theme);
                const setCookie = (name: string, value: string, days = 365) => {
                    const maxAge = days * 24 * 60 * 60;
                    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
                };
                setCookie('appearance', data.theme);
                
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
        <ProfileWrapper 
            breadcrumbs={[
                { title: t(currentLanguage, 'appearance.title'), href: routes.appearancePage }
            ]}
            title={t(currentLanguage, 'appearance.title')}
        >
            <div className="space-y-6">
                {/* Flash Messages */}
                {flashMessage && (
                    <div 
                        className="cursor-pointer"
                        onClick={() => setFlashMessage(null)}
                    >
                        <FlashMessage 
                            flash={flashMessage} 
                        />
                    </div>
                )}

                <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-500 group">
                    <CardHeader className="bg-gradient-to-r from-slate-100/80 to-slate-200/80 dark:from-slate-700/50 dark:to-slate-800/50 backdrop-blur-sm border-b border-slate-200/50 dark:border-slate-600/50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
                            <div className="flex items-center space-x-6">
                                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                    <Palette className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                                        {t(currentLanguage, 'appearance.theme.title')}
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                            <Palette className="h-3 w-3 mr-1" />
                                            Personalization
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {t(currentLanguage, 'appearance.theme.description')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-6 py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Theme Selection */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <Palette className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    {t(currentLanguage, 'appearance.theme.preference')}
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-5 bg-slate-50/80 dark:bg-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-600/50">
                                        <div className="grid grid-cols-3 gap-4">
                                            <Button
                                                variant={data.theme === 'light' ? 'default' : 'outline'}
                                                onClick={() => handleThemeChange('light')}
                                                className={`flex flex-col items-center gap-3 h-auto py-6 transition-all duration-300 rounded-xl ${
                                                    data.theme === 'light' 
                                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                                                        : 'border-2 border-slate-200/50 dark:border-slate-600/50 text-slate-600 dark:text-slate-400 hover:bg-green-50/80 dark:hover:bg-green-900/20 hover:border-green-400 dark:hover:border-green-500 hover:text-green-600 dark:hover:text-green-400'
                                                }`}
                                            >
                                                <Sun className="h-6 w-6" />
                                                <span className="text-sm font-semibold">{t(currentLanguage, 'appearance.theme.light')}</span>
                                            </Button>
                                            <Button
                                                variant={data.theme === 'dark' ? 'default' : 'outline'}
                                                onClick={() => handleThemeChange('dark')}
                                                className={`flex flex-col items-center gap-3 h-auto py-6 transition-all duration-300 rounded-xl ${
                                                    data.theme === 'dark' 
                                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                                                        : 'border-2 border-slate-200/50 dark:border-slate-600/50 text-slate-600 dark:text-slate-400 hover:bg-green-50/80 dark:hover:bg-green-900/20 hover:border-green-400 dark:hover:border-green-500 hover:text-green-600 dark:hover:text-green-400'
                                                }`}
                                            >
                                                <Moon className="h-6 w-6" />
                                                <span className="text-sm font-semibold">{t(currentLanguage, 'appearance.theme.dark')}</span>
                                            </Button>
                                            <Button
                                                variant={data.theme === 'system' ? 'default' : 'outline'}
                                                onClick={() => handleThemeChange('system')}
                                                className={`flex flex-col items-center gap-3 h-auto py-6 transition-all duration-300 rounded-xl ${
                                                    data.theme === 'system' 
                                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105' 
                                                        : 'border-2 border-slate-200/50 dark:border-slate-600/50 text-slate-600 dark:text-slate-400 hover:bg-green-50/80 dark:hover:bg-green-900/20 hover:border-green-400 dark:hover:border-green-500 hover:text-green-600 dark:hover:text-green-400'
                                                }`}
                                            >
                                                <Monitor className="h-6 w-6" />
                                                <span className="text-sm font-semibold">{t(currentLanguage, 'appearance.theme.system')}</span>
                                            </Button>
                                        </div>
                                        {data.theme === 'system' && (
                                            <div className="mt-4 text-sm text-slate-600 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                                                {t(currentLanguage, 'appearance.theme.systemDescription', { theme: systemTheme })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Language Selection */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                        <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    {t(currentLanguage, 'appearance.language.title')}
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-5 bg-slate-50/80 dark:bg-slate-700/30 rounded-xl border border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-100/80 dark:hover:bg-slate-700/50 transition-colors duration-200">
                                        <div className="space-y-3">
                                            <Label htmlFor="language" className="text-sm font-medium text-slate-700 dark:text-slate-300">{t(currentLanguage, 'appearance.language.title')}</Label>
                                            <Select value={data.language} onValueChange={(value) => setData('language', value)}>
                                                <SelectTrigger className="border-2 border-slate-200/50 dark:border-slate-600/50 focus:border-green-500 dark:focus:border-green-400 focus:ring-4 focus:ring-green-100/50 dark:focus:ring-green-900/30 transition-all duration-300 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50">
                                                    {languages.map((lang) => (
                                                        <SelectItem key={lang.code} value={lang.code} className="hover:bg-green-50/80 dark:hover:bg-green-900/20 focus:bg-green-50/80 dark:focus:bg-green-900/20">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-lg">{lang.flag}</span>
                                                                <span className="text-slate-700 dark:text-slate-300 font-medium">{lang.name}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-slate-200/50 dark:border-slate-600/50">
                    <Button 
                        onClick={handleSave} 
                        disabled={processing || !hasChanges}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        <Palette className="h-4 w-4" />
                        {processing ? t(currentLanguage, 'appearance.actions.saving') : t(currentLanguage, 'appearance.actions.save')}
                    </Button>
                </div>
            </div>
        </ProfileWrapper>
    );
}
