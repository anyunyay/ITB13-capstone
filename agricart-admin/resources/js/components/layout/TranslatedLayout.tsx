import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';

interface TranslatedLayoutProps {
    children: React.ReactNode;
    title?: string;
    titleKey?: string;
    showHeader?: boolean;
    showSidebar?: boolean;
}

/**
 * Layout component that applies translations to common UI elements
 * This can wrap existing layouts to add translation support
 */
export function TranslatedLayout({ 
    children, 
    title, 
    titleKey, 
    showHeader = true, 
    showSidebar = true 
}: TranslatedLayoutProps) {
    const { t } = useTranslation();

    // Get translated title
    const translatedTitle = titleKey ? t(titleKey, title) : title;

    return (
        <div className="min-h-screen bg-background">
            {showHeader && (
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="container flex h-14 items-center">
                        {translatedTitle && (
                            <h1 className="text-lg font-semibold">{translatedTitle}</h1>
                        )}
                    </div>
                </header>
            )}
            
            <div className="flex">
                {showSidebar && (
                    <aside className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        {/* Sidebar content would go here */}
                    </aside>
                )}
                
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}