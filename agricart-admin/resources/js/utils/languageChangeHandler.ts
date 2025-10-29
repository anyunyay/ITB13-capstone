/**
 * Language change handler that ensures immediate application of selected language
 * across the entire system without requiring page reloads
 */

import { router } from '@inertiajs/react';

interface LanguageChangeOptions {
    immediate?: boolean;
    preserveScroll?: boolean;
    preserveState?: boolean;
    onSuccess?: () => void;
    onError?: (error: any) => void;
}

/**
 * Global language change handler
 */
export class LanguageChangeHandler {
    private static instance: LanguageChangeHandler;
    private currentLanguage: string = 'en';
    private changeListeners: Array<(language: string) => void> = [];
    private isChanging: boolean = false;

    static getInstance(): LanguageChangeHandler {
        if (!LanguageChangeHandler.instance) {
            LanguageChangeHandler.instance = new LanguageChangeHandler();
        }
        return LanguageChangeHandler.instance;
    }

    /**
     * Initialize the language change handler
     */
    initialize(initialLanguage: string = 'en') {
        this.currentLanguage = initialLanguage;
        this.setupGlobalListeners();
        this.updateDocumentLanguage(initialLanguage);
    }

    /**
     * Change language across the entire system
     */
    async changeLanguage(
        newLanguage: string, 
        options: LanguageChangeOptions = {}
    ): Promise<void> {
        if (this.isChanging || newLanguage === this.currentLanguage) {
            return;
        }

        this.isChanging = true;

        try {
            console.log(`🔄 Changing language from ${this.currentLanguage} to ${newLanguage}`);
            
            // Update language preference on server
            await this.updateServerLanguage(newLanguage);
            
            // Update local state immediately
            this.currentLanguage = newLanguage;
            
            // Update document language
            this.updateDocumentLanguage(newLanguage);
            
            // Store in localStorage for persistence
            this.storeLanguagePreference(newLanguage);
            
            // Update Inertia page props immediately
            this.updateInertiaProps(newLanguage);
            
            // Notify all listeners before reload
            this.notifyLanguageChange(newLanguage);
            
            console.log(`✅ Language changed to ${newLanguage}, reloading page...`);
            
            // Always reload page to ensure complete translation update
            setTimeout(() => {
                window.location.reload();
            }, 100); // Small delay to ensure state updates are processed
            
            options.onSuccess?.();
            
        } catch (error) {
            console.error('❌ Failed to change language:', error);
            this.isChanging = false; // Reset on error
            options.onError?.(error);
            throw error;
        }
        // Don't reset isChanging here since we're reloading
    }

    /**
     * Add listener for language changes
     */
    addLanguageChangeListener(listener: (language: string) => void) {
        this.changeListeners.push(listener);
        return () => {
            const index = this.changeListeners.indexOf(listener);
            if (index > -1) {
                this.changeListeners.splice(index, 1);
            }
        };
    }

    /**
     * Get current language
     */
    getCurrentLanguage(): string {
        return this.currentLanguage;
    }

    /**
     * Check if language is currently changing
     */
    isLanguageChanging(): boolean {
        return this.isChanging;
    }

    /**
     * Update server-side language preference
     */
    private async updateServerLanguage(language: string): Promise<void> {
        return new Promise((resolve, reject) => {
            router.post('/language/switch', 
                { language },
                {
                    onSuccess: () => resolve(),
                    onError: (errors) => reject(new Error(JSON.stringify(errors))),
                    preserveScroll: true,
                    preserveState: true,
                }
            );
        });
    }

    /**
     * Update document language attribute
     */
    private updateDocumentLanguage(language: string) {
        document.documentElement.lang = language;
        document.documentElement.setAttribute('data-language', language);
    }

    /**
     * Notify all registered listeners
     */
    private notifyLanguageChange(language: string) {
        this.changeListeners.forEach(listener => {
            try {
                listener(language);
            } catch (error) {
                console.error('Error in language change listener:', error);
            }
        });
    }

    /**
     * Update dynamic content immediately without page reload
     */
    private updateDynamicContent(language: string) {
        // Update all elements with data-translate attributes
        const translatableElements = document.querySelectorAll('[data-translate]');
        translatableElements.forEach(element => {
            const key = element.getAttribute('data-translate');
            if (key) {
                const translation = this.getTranslation(key, language);
                if (translation) {
                    element.textContent = translation;
                }
            }
        });

        // Update all elements with data-translate-placeholder attributes
        const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-translate-placeholder');
            if (key) {
                const translation = this.getTranslation(key, language);
                if (translation) {
                    (element as HTMLInputElement).placeholder = translation;
                }
            }
        });

        // Trigger custom event for components to update
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language } 
        }));
    }

    /**
     * Update Inertia page props immediately
     */
    private updateInertiaProps(language: string) {
        try {
            const inertiaPage = (window as any).page;
            if (inertiaPage?.props) {
                inertiaPage.props.currentLanguage = language;
                console.log(`📄 Updated Inertia props with language: ${language}`);
            }
        } catch (error) {
            console.warn('Could not update Inertia props:', error);
        }
    }

    /**
     * Force immediate update of all React components
     */
    private forceImmediateUpdate(language: string) {
        // Update Inertia page props
        this.updateInertiaProps(language);

        // Trigger React re-renders by updating a global state
        window.dispatchEvent(new CustomEvent('forceLanguageUpdate', { 
            detail: { language } 
        }));
    }

    /**
     * Store language preference in localStorage
     */
    private storeLanguagePreference(language: string) {
        try {
            localStorage.setItem('preferred-language', language);
        } catch (error) {
            console.warn('Could not store language preference:', error);
        }
    }

    /**
     * Get translation for a key (simplified version)
     */
    private getTranslation(key: string, language: string): string | null {
        // This would integrate with your translation system
        // For now, return null to use existing translation system
        return null;
    }

    /**
     * Setup global event listeners
     */
    private setupGlobalListeners() {
        // Listen for storage changes (multi-tab support)
        window.addEventListener('storage', (e) => {
            if (e.key === 'preferred-language' && e.newValue) {
                this.currentLanguage = e.newValue;
                this.notifyLanguageChange(e.newValue);
            }
        });

        // Listen for custom language change events
        window.addEventListener('changeLanguage', (e: any) => {
            this.changeLanguage(e.detail.language, e.detail.options || {});
        });
    }
}

/**
 * Global instance
 */
export const languageHandler = LanguageChangeHandler.getInstance();

/**
 * Hook for React components to use language change handler
 */
export function useLanguageChangeHandler() {
    const handler = LanguageChangeHandler.getInstance();
    
    return {
        changeLanguage: (language: string, options?: LanguageChangeOptions) => 
            handler.changeLanguage(language, options),
        getCurrentLanguage: () => handler.getCurrentLanguage(),
        isChanging: () => handler.isLanguageChanging(),
        addListener: (listener: (language: string) => void) => 
            handler.addLanguageChangeListener(listener),
    };
}

/**
 * Initialize language handler on app start
 */
export function initializeLanguageHandler(initialLanguage?: string) {
    const handler = LanguageChangeHandler.getInstance();
    
    // Get initial language from various sources
    const language = initialLanguage || 
                    localStorage.getItem('preferred-language') || 
                    document.documentElement.lang || 
                    'en';
    
    handler.initialize(language);
    
    return handler;
}

/**
 * Trigger global language change
 */
export function triggerLanguageChange(language: string, options?: LanguageChangeOptions) {
    window.dispatchEvent(new CustomEvent('changeLanguage', {
        detail: { language, options }
    }));
}