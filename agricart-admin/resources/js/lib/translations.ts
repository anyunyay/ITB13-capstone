// Simple translation helper for frontend
// In a full implementation, you would load these from the backend or use a proper i18n library

const translations = {
    en: {
        'appearance.language_preferences': 'Language Preferences',
        'appearance.language_description': 'Choose your preferred language. This will change the interface language across the application.',
        'appearance.current_language': 'Current language',
        'appearance.english': 'English',
        'appearance.tagalog': 'Tagalog',
        'appearance.language_updated': 'Language preference updated successfully!',
        'appearance.language_update_failed': 'Failed to update language preference. Please try again.',
    },
    fil: {
        'appearance.language_preferences': 'Mga Kagustuhan sa Wika',
        'appearance.language_description': 'Piliin ang inyong gustong wika. Ito ay magbabago sa wika ng interface sa buong aplikasyon.',
        'appearance.current_language': 'Kasalukuyang wika',
        'appearance.english': 'Ingles',
        'appearance.tagalog': 'Tagalog',
        'appearance.language_updated': 'Matagumpay na na-update ang kagustuhan sa wika!',
        'appearance.language_update_failed': 'Hindi na-update ang kagustuhan sa wika. Subukan ulit.',
    }
};

export function __(key: string, locale: string = 'en'): string {
    const lang = locale as keyof typeof translations;
    const langTranslations = translations[lang] || translations.en;
    return (langTranslations as any)[key] || key;
}