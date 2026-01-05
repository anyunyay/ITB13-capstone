/**
 * Generate a proper asset URL for storage files
 * This handles both local development and production environments
 */
export function storageUrl(path: string): string {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    
    // In production, use the full origin to ensure HTTPS
    if (typeof window !== 'undefined') {
        return `${window.location.origin}/${cleanPath}`;
    }
    
    // Fallback for SSR
    return `/${cleanPath}`;
}

/**
 * Generate asset URL specifically for storage/public files
 */
export function publicStorageUrl(path: string): string {
    const cleanPath = path.startsWith('storage/') ? path : `storage/${path}`;
    return storageUrl(cleanPath);
}