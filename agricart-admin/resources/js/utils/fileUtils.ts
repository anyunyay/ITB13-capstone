/**
 * File utilities for secure file access
 */

interface FileObject {
    id?: number;
    path?: string;
    type?: string;
}

interface UploadResponse {
    id: number;
    url: string;
    filename: string;
    original_name: string;
}

// Get secure file URL with authentication
export const getSecureFileUrl = async (fileId: number, authToken: string): Promise<string> => {
    try {
        const response = await fetch(`/api/files/${fileId}/url`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            return data.data.url;
        } else {
            throw new Error(data.message || 'Failed to get file URL');
        }
    } catch (error) {
        console.error('Error getting secure file URL:', error);
        return getFallbackImageUrl();
    }
};

// Get fallback image URL
export const getFallbackImageUrl = async (): Promise<string> => {
    try {
        const response = await fetch('/api/files/fallback-image', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            },
        });

        const data = await response.json();
        return data.success ? data.data.url : '/storage/fallback-photo.png';
    } catch (error) {
        console.error('Error getting fallback image:', error);
        return '/storage/fallback-photo.png';
    }
};

// Check if file is a product image (public)
export const isProductImage = (fileType: string): boolean => {
    return fileType === 'product-image';
};

// Build secure private file URL
export const buildPrivateFileUrl = (filename: string, type: 'document' | 'delivery-proof'): string => {
    const folder = type === 'document' ? 'documents' : 'delivery-proofs';
    return `/private-file/${folder}/${filename}`;
};

// Get direct URL for product images, secure URL for private files
export const getFileUrl = async (file: FileObject, authToken: string): Promise<string> => {
    if (file.type && isProductImage(file.type)) {
        // Product images are public
        return `/storage/${file.path}`;
    } else if (file.path && file.type) {
        // Private files use secure route with folder and filename
        const folder = file.type === 'document' ? 'documents' : 'delivery-proofs';
        return `/private-file/${folder}/${file.path}`;
    } else if (file.id) {
        // Fallback to secure access by ID
        return await getSecureFileUrl(file.id, authToken);
    } else {
        // Fallback for files without proper structure
        return await getFallbackImageUrl();
    }
};

// Upload file with proper endpoint selection
export const uploadFile = async (
    file: File, 
    type: string, 
    authToken: string, 
    additionalData: Record<string, any> = {}
): Promise<UploadResponse> => {
    const formData = new FormData();
    
    let endpoint: string;
    if (type === 'product-image') {
        formData.append('image', file);
        endpoint = '/api/product-images/upload';
    } else if (type === 'document') {
        formData.append('document', file);
        endpoint = '/private/documents/upload';
    } else if (type === 'delivery-proof') {
        formData.append('proof', file);
        endpoint = '/private/delivery-proofs/upload';
    } else {
        throw new Error('Invalid file type');
    }

    // Add any additional data
    Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
    });

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message || 'Upload failed');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

// Delete file
export const deleteFile = async (fileId: number, authToken: string): Promise<boolean> => {
    try {
        const response = await fetch(`/private/files/${fileId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
            return true;
        } else {
            throw new Error(data.message || 'Delete failed');
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};