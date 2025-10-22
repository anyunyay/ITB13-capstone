import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from './contexts/ThemeContext';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Force a refresh when returning via back/forward cache
if (typeof window !== 'undefined') {
    
    // This event is fired when the page is loaded from the back/forward cache
    window.addEventListener('pageshow', (event: PageTransitionEvent) => {
        const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
        const navType = entries.length > 0 ? entries[0].type : undefined;

        if (event.persisted || navType === 'back_forward') {
            window.location.reload();
        }
    });

    // Force a refresh when the back button is pressed
    window.addEventListener('popstate', () => {
        window.location.reload();
    });
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        const adminPages = import.meta.glob('./pages/Admin/**/*.tsx');
        const rootPages = import.meta.glob('./pages/**/*.tsx');
        if (adminPages[`./pages/Admin/${name}.tsx`]) {
            return resolvePageComponent(`./pages/Admin/${name}.tsx`, adminPages);
        }
        return resolvePageComponent(`./pages/${name}.tsx`, rootPages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ThemeProvider>
                <App {...props} />
            </ThemeProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
