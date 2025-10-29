import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePage } from '@inertiajs/react';
import { Sun, Moon, Monitor, Palette, Check, Languages } from 'lucide-react';
import ProfileWrapper from './profile-wrapper';
import { useAppearance } from '@/hooks/use-appearance';
import { useLanguage } from '@/hooks/use-language';
import { __ } from '@/lib/translations';
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
    const { language, updateLanguage, isLoading: languageLoading } = useLanguage();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);



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

    const handleLanguageChange = async (newLanguage: 'en' | 'fil') => {
        try {
            setMessage(null);
            await updateLanguage(newLanguage);
            setMessage({ type: 'success', text: __('appearance.language_updated', language) });
        } catch (error) {
            console.error('Failed to update language:', error);
            setMessage({ type: 'error', text: __('appearance.language_update_failed', language) });
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
                                    {__('appearance.language_preferences', language)}
                                </CardTitle>
                                <CardDescription>
                                    {__('appearance.language_description', language)}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-foreground">
                                Select Language
                            </label>
                            <Select
                                value={language}
                                onValueChange={handleLanguageChange}
                                disabled={languageLoading}
                            >
                                <SelectTrigger className={cn(
                                    "w-full",
                                    "border-green-200 dark:border-green-800",
                                    "focus:border-green-600 focus:ring-green-600/20",
                                    "hover:border-green-300 dark:hover:border-green-700"
                                )}>
                                    <SelectValue placeholder="Select a language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="en">
                                        <div className="flex items-center gap-2">
                                            <span>🇺🇸</span>
                                            <span>{__('appearance.english', language)}</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="fil">
                                        <div className="flex items-center gap-2">
                                            <span>🇵🇭</span>
                                            <span>{__('appearance.tagalog', language)}</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Current Language Info */}
                        <div className="mt-6 p-4 bg-muted rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Languages className="h-4 w-4" />
                                <span>
                                    {__('appearance.current_language', language)}: <strong className="text-foreground">
                                        {language === 'en' ? __('appearance.english', language) : __('appearance.tagalog', language)}
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
