/**
 * CSRF Token Cleanup Utility
 * 
 * This utility provides functions to clear CSRF tokens from various storage locations
 * when users log out or when sessions are invalidated.
 */

/**
 * Clear CSRF tokens from all possible storage locations
 * This includes localStorage, sessionStorage, and Axios defaults (if available)
 */
export function clearCsrfTokens(): void {
    try {
        // Clear from localStorage
        localStorage.removeItem('X-CSRF-TOKEN');
        
        // Clear from sessionStorage
        sessionStorage.removeItem('X-CSRF-TOKEN');
        
        // Clear from Axios defaults if Axios is available
        if (typeof window !== 'undefined' && (window as any).axios) {
            delete (window as any).axios.defaults.headers.common['X-CSRF-TOKEN'];
        }
        
        // Clear any other CSRF-related storage keys
        const csrfKeys = [
            'csrf_token',
            'csrf-token',
            'laravel_token',
            'laravel-token',
            'XSRF-TOKEN',
            'xsrf-token'
        ];
        
        csrfKeys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
        
        console.log('CSRF tokens cleared from all storage locations');
    } catch (error) {
        console.warn('Error clearing CSRF tokens:', error);
    }
}

/**
 * Clear CSRF tokens and other session-related data
 * This is a comprehensive cleanup function for logout scenarios
 */
export function clearSessionData(): void {
    try {
        // Clear CSRF tokens
        clearCsrfTokens();
        
        // Clear login session storage
        const loginSessionId = sessionStorage.getItem('loginSessionId');
        if (loginSessionId) {
            sessionStorage.removeItem('loginSessionId');
            sessionStorage.removeItem(`urgentPopupShown_${loginSessionId}`);
            console.log('Cleared login session data');
        }
        
        // Clear any other session-related data
        const sessionKeys = [
            'auth_token',
            'auth-token',
            'user_session',
            'user-session',
            'remember_token',
            'remember-token'
        ];
        
        sessionKeys.forEach(key => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
        
        console.log('Session data cleared successfully');
    } catch (error) {
        console.warn('Error clearing session data:', error);
    }
}

/**
 * Check if CSRF tokens exist in storage
 * Useful for debugging or validation purposes
 */
export function hasCsrfTokens(): boolean {
    try {
        const hasLocalStorage = !!localStorage.getItem('X-CSRF-TOKEN');
        const hasSessionStorage = !!sessionStorage.getItem('X-CSRF-TOKEN');
        const hasAxiosDefault = typeof window !== 'undefined' && 
                               (window as any).axios && 
                               !!(window as any).axios.defaults.headers.common['X-CSRF-TOKEN'];
        
        return hasLocalStorage || hasSessionStorage || hasAxiosDefault;
    } catch (error) {
        console.warn('Error checking CSRF tokens:', error);
        return false;
    }
}

/**
 * Get CSRF token from storage
 * Returns the first available CSRF token from various storage locations
 */
export function getCsrfToken(): string | null {
    try {
        // Check localStorage first
        const localToken = localStorage.getItem('X-CSRF-TOKEN');
        if (localToken) return localToken;
        
        // Check sessionStorage
        const sessionToken = sessionStorage.getItem('X-CSRF-TOKEN');
        if (sessionToken) return sessionToken;
        
        // Check Axios defaults
        if (typeof window !== 'undefined' && (window as any).axios) {
            const axiosToken = (window as any).axios.defaults.headers.common['X-CSRF-TOKEN'];
            if (axiosToken) return axiosToken;
        }
        
        return null;
    } catch (error) {
        console.warn('Error getting CSRF token:', error);
        return null;
    }
}

/**
 * Get CSRF token from meta tag
 * This is the primary method for getting CSRF tokens in Laravel applications
 */
export function getCsrfTokenFromMeta(): string | null {
    try {
        if (typeof document === 'undefined') return null;
        
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        return metaTag?.getAttribute('content') || null;
    } catch (error) {
        console.warn('Error getting CSRF token from meta tag:', error);
        return null;
    }
}

/**
 * Refresh CSRF token by making a request to Laravel's CSRF route
 * This is useful when the current token has expired
 */
export async function refreshCsrfToken(): Promise<string | null> {
    try {
        const response = await fetch('/csrf-token', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            return data.csrf_token || null;
        }
        
        return null;
    } catch (error) {
        console.warn('Error refreshing CSRF token:', error);
        return null;
    }
}
