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
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/useToast';
import { useThemeChange, useEffectiveTheme } from '@/hooks/useThemeChange';
import { ToastContainer } from '@/components/ui/toast';

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
    const { theme, setTheme, isLoading: themeLoading, error: themeError } = useTheme();
    const { toasts, removeToast, showSuccess, showError } = useToast();
    const themeChangeKey = useThemeChange(); // Force re-render on theme change
    const effectiveTheme = useEffectiveTheme(); // Get current effective theme
    
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
        theme: user?.theme || 'system',
        language: user?.language || 'en',
    });

    // Check if any changes have been made
    const hasChanges = data.theme !== initialValues.theme || data.language !== initialValues.language;

    // Sync form state with server-side theme on mount (only once)
    useEffect(() => {
        const serverTheme = user?.theme || 'system';
        const serverLanguage = user?.language || 'en';
        
        // Update initial values to match server state
        setInitialValues({
            theme: serverTheme,
            language: serverLanguage,
        });
        
        // Always sync form data with server state on mount
        setData('theme', serverTheme);
        setData('language', serverLanguage);
    }, []); // Only run on mount

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

    // Sync form data with theme context when theme changes
    useEffect(() => {
        if (data.theme !== theme) {
            setData('theme', theme);
        }
    }, [theme]);


    const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
        try {
            setData('theme', newTheme);
            await setTheme(newTheme);
            showSuccess(t(currentLanguage, 'appearance.messages.success'));
        } catch (error) {
            console.error('Theme change failed:', error);
            showError(t(currentLanguage, 'appearance.messages.error'));
        }
    };

    const handleSave = () => {
        // Validate theme before saving
        if (!['light', 'dark', 'system'].includes(data.theme)) {
            showError('Invalid theme selection');
            return;
        }

        patch(routes.appearanceUpdate, {
            onSuccess: () => {
                showSuccess(t(currentLanguage, 'appearance.messages.success'));
                
                // Update initial values to current values after successful save
                setInitialValues({
                    theme: data.theme,
                    language: data.language,
                });
            },
            onError: (errors) => {
                console.error('Appearance update failed:', errors);
                showError(t(currentLanguage, 'appearance.messages.error'));
            },
        });
    };

    const languages = [
        { code: 'en', name: t(currentLanguage, 'appearance.language.english'), flag: '🇺🇸' },
        { code: 'fil', name: t(currentLanguage, 'appearance.language.tagalog'), flag: '🇵🇭' },
    ];

    return (
        <ProfileWrapper 
            title={t(currentLanguage, 'appearance.title')}
            key={themeChangeKey} // Force re-render on theme change
        >
            <div className="space-y-6" key={`content-${themeChangeKey}`}>
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

                <Card className="bg-card/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/20 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group">
                    <CardHeader className="bg-gradient-to-r from-muted/80 to-muted/60 backdrop-blur-sm border-b border-border/50">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6">
                            <div className="flex items-center space-x-6">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Palette className="h-6 w-6 text-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h1 className="text-2xl font-bold text-card-foreground">
                                        {t(currentLanguage, 'appearance.theme.title')}
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                                            <Palette className="h-3 w-3 mr-1" />
                                            Personalization
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
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
                                <h3 className="text-xl font-semibold text-card-foreground flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-secondary/10">
                                        <Palette className="h-5 w-5 text-secondary" />
                                    </div>
                                    {t(currentLanguage, 'appearance.theme.preference')}
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-5 bg-muted/80 rounded-xl border border-border/50">
                                        <div className="grid grid-cols-3 gap-4">
                                            <Button
                                                variant={theme === 'light' ? 'default' : 'outline'}
                                                onClick={() => handleThemeChange('light')}
                                                disabled={themeLoading}
                                                className={`flex flex-col items-center gap-3 h-auto py-6 transition-all duration-300 rounded-xl ${
                                                    theme === 'light' 
                                                        ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105' 
                                                        : 'border-2 border-border/50 text-muted-foreground hover:bg-primary/10 hover:border-primary hover:text-primary'
                                                }`}
                                            >
                                                <Sun className="h-6 w-6" />
                                                <span className="text-sm font-semibold">{t(currentLanguage, 'appearance.theme.light')}</span>
                                            </Button>
                                            <Button
                                                variant={theme === 'dark' ? 'default' : 'outline'}
                                                onClick={() => handleThemeChange('dark')}
                                                disabled={themeLoading}
                                                className={`flex flex-col items-center gap-3 h-auto py-6 transition-all duration-300 rounded-xl ${
                                                    theme === 'dark' 
                                                        ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105' 
                                                        : 'border-2 border-border/50 text-muted-foreground hover:bg-primary/10 hover:border-primary hover:text-primary'
                                                }`}
                                            >
                                                <Moon className="h-6 w-6" />
                                                <span className="text-sm font-semibold">{t(currentLanguage, 'appearance.theme.dark')}</span>
                                            </Button>
                                            <Button
                                                variant={theme === 'system' ? 'default' : 'outline'}
                                                onClick={() => handleThemeChange('system')}
                                                disabled={themeLoading}
                                                className={`flex flex-col items-center gap-3 h-auto py-6 transition-all duration-300 rounded-xl ${
                                                    theme === 'system' 
                                                        ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105' 
                                                        : 'border-2 border-border/50 text-muted-foreground hover:bg-primary/10 hover:border-primary hover:text-primary'
                                                }`}
                                            >
                                                <Monitor className="h-6 w-6" />
                                                <span className="text-sm font-semibold">{t(currentLanguage, 'appearance.theme.system')}</span>
                                            </Button>
                                        </div>
                                        {theme === 'system' && (
                                            <div className="mt-4 text-sm text-muted-foreground bg-muted/80 p-3 rounded-lg border border-border/50">
                                                {t(currentLanguage, 'appearance.theme.systemDescription', { theme: systemTheme })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Language Selection */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-card-foreground flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Globe className="h-5 w-5 text-primary" />
                                    </div>
                                    {t(currentLanguage, 'appearance.language.title')}
                                </h3>
                                <div className="space-y-4">
                                    <div className="p-5 bg-muted/80 rounded-xl border border-border/50 hover:bg-muted/60 transition-colors duration-200">
                                        <div className="space-y-3">
                                            <Label htmlFor="language" className="text-sm font-medium text-card-foreground">{t(currentLanguage, 'appearance.language.title')}</Label>
                                            <Select value={data.language} onValueChange={(value) => setData('language', value)}>
                                                <SelectTrigger className="border-2 border-border/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 rounded-xl bg-card/50 backdrop-blur-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-card/95 backdrop-blur-sm border border-border/50">
                                                    {languages.map((lang) => (
                                                        <SelectItem key={lang.code} value={lang.code} className="hover:bg-primary/10 focus:bg-primary/10">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-lg">{lang.flag}</span>
                                                                <span className="text-card-foreground font-medium">{lang.name}</span>
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
                <div className="flex justify-end pt-6 border-t border-border/50">
                    <Button 
                        onClick={handleSave} 
                        disabled={processing || !hasChanges}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        <Palette className="h-4 w-4" />
                        {processing ? t(currentLanguage, 'appearance.actions.saving') : t(currentLanguage, 'appearance.actions.save')}
                    </Button>
                </div>
            </div>
            
            {/* Toast Container */}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ProfileWrapper>
    );
}
