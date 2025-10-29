import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePage } from '@inertiajs/react';
import { Sun, Moon, Monitor, Palette, Check, Languages } from 'lucide-react';
import ProfileWrapper from './profile-wrapper';
import { useAppearance } from '@/hooks/use-appearance';
import { useLanguage } from '@/hooks/use-language';
import { cn } from '@/lib/utils';

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

const appearanceOptions: { value: Appearance; label: string; description: string; icon: any }[] = [
    {
        value: 'light',
        label: 'Light',
        description: 'Always use light mode',
        icon: Sun,
    },
    {
        value: 'dark',
        label: 'Dark',
        description: 'Always use dark mode',
        icon: Moon,
    },
    {
        value: 'system',
        label: 'System',
        description: 'Use your system preference',
        icon: Monitor,
    },
];

export default function AppearancePage() {
    const { user } = usePage<PageProps>().props;
    const { appearance, updateAppearance } = useAppearance();
    const { language, updateLanguage, isLoading: isLanguageLoading } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Generate dynamic routes based on user type
    const getProfileRoutes = () => {
        const userType = user.type;
        const baseRoute = userType === 'customer' ? '/customer' : 
                         userType === 'admin' || userType === 'staff' ? '/admin' :
                         userType === 'logistic' ? '/logistic' :
                         userType === 'member' ? '/member' : '/customer';
        
        return {
            appearancePage: `${baseRoute}/profile/appearance`,
        };
    };

    const routes = getProfileRoutes();

    const handleAppearanceChange = async (newAppearance: Appearance) => {
        try {
            setIsLoading(true);
            setMessage(null);
            
            // Update appearance using the built-in hook
            updateAppearance(newAppearance);
            
            // Show success message
            setMessage({ type: 'success', text: 'Appearance settings updated successfully!' });
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
            
        } catch (error) {
            console.error('Failed to update appearance:', error);
            setMessage({ type: 'error', text: 'Failed to update appearance settings. Please try again.' });
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
            setMessage({ type: 'success', text: 'Language preference updated successfully!' });
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
            
        } catch (error) {
            console.error('Failed to update language:', error);
            setMessage({ type: 'error', text: 'Failed to update language preference. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ProfileWrapper 
            title="Appearance Settings"
        >
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
                                    Theme Preferences
                                </CardTitle>
                                <CardDescription>
                                    Choose how you want the application to look. Your preference will be saved and applied across all devices.
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
                                    Current selection: <strong className="text-foreground">
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
                                Language Preferences
                            </CardTitle>
                            <CardDescription>
                                Choose your preferred language. Your selection will be saved and applied across all devices.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="language-select" className="text-sm font-medium">
                            Select Language
                        </label>
                        <Select
                            value={language}
                            onValueChange={(value: 'en' | 'tl') => handleLanguageChange(value)}
                            disabled={isLoading || isLanguageLoading}
                        >
                            <SelectTrigger id="language-select" className="w-full">
                                <SelectValue placeholder="Select a language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="tl">Tagalog</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Current Selection Info */}
                    <div className="mt-6 p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Languages className="h-4 w-4" />
                            <span>
                                Current selection: <strong className="text-foreground">
                                    {language === 'en' ? 'English' : 'Tagalog'}
                                </strong>
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    </ProfileWrapper>
    );
}
