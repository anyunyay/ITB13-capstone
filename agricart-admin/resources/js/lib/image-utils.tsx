/**
 * Utility functions for handling images with fallbacks
 */

/**
 * Gets the image source with fallback to default product image
 * @param imagePath - The image path from the database
 * @param defaultPath - Optional custom default path, defaults to default-product.jpg
 * @returns The image source URL with fallback
 */
export function getImageSource(imagePath: string | null | undefined, defaultPath: string = '/storage/fallback-photo.png'): string {
  if (!imagePath) {
    return defaultPath;
  }
  
  // If the path already starts with /, use it as is
  if (imagePath.startsWith('/')) {
    return imagePath;
  }
  
  // If the path doesn't start with /, add it
  return `/${imagePath}`;
}

/**
 * Handles image load error by setting a fallback image
 * @param event - The error event from the img element
 * @param fallbackSrc - The fallback image source
 */
export function handleImageError(event: React.SyntheticEvent<HTMLImageElement, Event>, fallbackSrc: string = '/storage/fallback-photo.png'): void {
  const img = event.currentTarget;
  if (img.src !== fallbackSrc) {
    img.src = fallbackSrc;
  }
}

/**
 * Creates an image element with error handling and fallback
 * @param src - The image source
 * @param alt - The alt text
 * @param className - CSS classes
 * @param fallbackSrc - The fallback image source
 * @returns JSX element for the image
 */
export function SafeImage({ 
  src, 
  alt, 
  className, 
  fallbackSrc = '/storage/fallback-photo.png',
  ...props 
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  [key: string]: any;
}) {
  const imageSrc = getImageSource(src, fallbackSrc);
  
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={(e) => handleImageError(e, fallbackSrc)}
      {...props}
    />
  );
}
