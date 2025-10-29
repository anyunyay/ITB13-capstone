// Translation helper for appearance settings
export const translations = {
    en: {
        appearance: {
            title: 'Appearance Settings',
            description: 'Customize your interface appearance and preferences',
            theme: {
                title: 'Theme & Display',
                description: 'Customize the appearance of your interface',
                preference: 'Theme Preference',
                light: 'Light',
                dark: 'Dark',
                system: 'System',
                systemDescription: (theme: string) => `Currently using ${theme} theme based on your system preference`,
            },
            language: {
                title: 'Language',
                description: 'Choose your preferred language',
                english: 'English',
                tagalog: 'Tagalog',
            },
            notifications: {
                title: 'Notification Preferences',
                description: 'Choose how you want to receive notifications',
                email: {
                    title: 'Email Notifications',
                    description: 'Receive order updates and promotions via email',
                },
                push: {
                    title: 'Push Notifications',
                    description: 'Get instant notifications in your browser',
                },
                sms: {
                    title: 'SMS Notifications',
                    description: 'Receive important updates via text message',
                },
            },
            actions: {
                save: 'Save Preferences',
                saving: 'Saving...',
            },
            messages: {
                success: 'Appearance settings saved successfully!',
                error: 'Failed to save appearance settings. Please try again.',
            },
        },
    },
    fil: {
        appearance: {
            title: 'Mga Setting sa Hitsura',
            description: 'I-customize ang hitsura ng inyong interface at mga kagustuhan',
            theme: {
                title: 'Tema at Display',
                description: 'I-customize ang hitsura ng inyong interface',
                preference: 'Kagustuhan sa Tema',
                light: 'Maliwanag',
                dark: 'Madilim',
                system: 'Sistema',
                systemDescription: (theme: string) => `Kasalukuyang gumagamit ng ${theme} na tema batay sa inyong kagustuhan sa sistema`,
            },
            language: {
                title: 'Wika',
                description: 'Piliin ang inyong gustong wika',
                english: 'English',
                tagalog: 'Tagalog',
            },
            notifications: {
                title: 'Mga Kagustuhan sa Notification',
                description: 'Piliin kung paano ninyo gustong makatanggap ng mga notification',
                email: {
                    title: 'Mga Email Notification',
                    description: 'Makatanggap ng mga update sa order at mga promosyon sa pamamagitan ng email',
                },
                push: {
                    title: 'Mga Push Notification',
                    description: 'Makatanggap ng instant na mga notification sa inyong browser',
                },
                sms: {
                    title: 'Mga SMS Notification',
                    description: 'Makatanggap ng mga mahahalagang update sa pamamagitan ng text message',
                },
            },
            actions: {
                save: 'I-save ang mga Kagustuhan',
                saving: 'Nagsa-save...',
            },
            messages: {
                success: 'Matagumpay na na-save ang mga setting sa hitsura!',
                error: 'Nabigo na i-save ang mga setting sa hitsura. Pakisubukan ulit.',
            },
        },
    },
};

export type Language = 'en' | 'fil';

export function getTranslation(language: Language, key: string): any {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return null;
        }
    }
    
    return value;
}

export function t(language: Language, key: string, params?: Record<string, any>): string {
    const translation = getTranslation(language, key);
    
    if (typeof translation === 'function') {
        return translation(params);
    }
    
    if (typeof translation === 'string') {
        if (params) {
            return translation.replace(/:(\w+)/g, (match, param) => {
                return params[param] || match;
            });
        }
        return translation;
    }
    
    return key; // Fallback to key if translation not found
}
