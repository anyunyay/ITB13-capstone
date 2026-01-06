import React, { useState, useEffect } from 'react';
import { getFileUrl, getFallbackImageUrl } from '../utils/fileUtils';

interface FileObject {
    id?: number;
    path?: string;
    type?: string;
}

interface SecureImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'onError'> {
    file: FileObject | string | null;
    authToken: string;
    className?: string;
    alt?: string;
    onError?: ((error: Error) => void) | null;
}

const SecureImage: React.FC<SecureImageProps> = ({ 
    file, 
    authToken, 
    className = '', 
    alt = '', 
    onError = null,
    ...props 
}) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    useEffect(() => {
        const loadImage = async () => {
            try {
                setLoading(true);
                setError(false);
                
                let url: string;
                if (file && typeof file === 'object' && file.id) {
                    // File object with ID
                    url = await getFileUrl(file, authToken);
                } else if (file && typeof file === 'object' && file.path && file.type === 'product-image') {
                    // Direct product image path
                    url = `/storage/${file.path}`;
                } else if (file && typeof file === 'object' && file.path && (file.type === 'document' || file.type === 'delivery-proof')) {
                    // Private file using secure route
                    const folder = file.type === 'document' ? 'documents' : 'delivery-proofs';
                    url = `/private-file/${folder}/${file.path}`;
                } else if (typeof file === 'string') {
                    // Direct URL string
                    url = file;
                } else {
                    // Fallback
                    url = await getFallbackImageUrl();
                }
                
                setImageUrl(url);
            } catch (err) {
                console.error('Error loading image:', err);
                setError(true);
                const fallbackUrl = await getFallbackImageUrl();
                setImageUrl(fallbackUrl);
                if (onError) onError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        loadImage();
    }, [file, authToken, onError]);

    const handleImageError = async () => {
        if (!error) {
            setError(true);
            const fallbackUrl = await getFallbackImageUrl();
            setImageUrl(fallbackUrl);
            if (onError) onError(new Error('Image failed to load'));
        }
    };

    if (loading) {
        return (
            <div className={`bg-gray-200 animate-pulse ${className}`} {...props}>
                <div className="flex items-center justify-center h-full">
                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <img
            src={imageUrl}
            alt={alt}
            className={className}
            onError={(e) => {
                e.currentTarget.src = '/images/fallback-photo.png';
                handleImageError();
            }}
            {...props}
        />
    );
};

export default SecureImage;
