import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageLightboxProps {
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({ src, alt, isOpen, onClose }: ImageLightboxProps) {
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  // Handle opening/closing animations
  useEffect(() => {
    if (isOpen) {
      // Calculate scrollbar width before hiding it
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      setShouldRender(true);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      
      // Prevent background shift by adding padding equal to scrollbar width
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Trigger animation after render
      requestAnimationFrame(() => {
        setIsAnimating(true);
      });
    } else {
      setIsAnimating(false);
      
      // Restore body styles
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match transition duration
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Touch handling for pinch-to-zoom
  useEffect(() => {
    if (!isOpen) return;

    let initialDistance = 0;
    let initialScale = 1;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        initialDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        initialScale = scale;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const currentDistance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        const newScale = Math.max(1, Math.min(4, initialScale * (currentDistance / initialDistance)));
        setScale(newScale);
      }
    };

    const imageElement = document.getElementById('lightbox-image');
    if (imageElement) {
      imageElement.addEventListener('touchstart', handleTouchStart, { passive: false });
      imageElement.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      if (imageElement) {
        imageElement.removeEventListener('touchstart', handleTouchStart);
        imageElement.removeEventListener('touchmove', handleTouchMove);
      }
    };
  }, [isOpen, scale]);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(1, Math.min(4, prev + delta)));
  };

  // Drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      {/* Blurred backdrop - blur appears immediately, only opacity animates */}
      <div 
        className="absolute inset-0 backdrop-blur-xl"
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(20px)'
        }}
      />

      {/* Close button */}
      <Button
        onClick={onClose}
        variant="ghost"
        size="icon"
        className={`absolute top-4 right-4 z-[10001] bg-white/10 hover:bg-white/20 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 transition-all duration-300 ${
          isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
        }`}
      >
        <X className="w-6 h-6 sm:w-8 sm:h-8" />
      </Button>

      {/* Image container */}
      <div
        className={`relative z-[10000] max-w-[95vw] max-h-[95vh] flex items-center justify-center transition-all duration-300 ${
          isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        }`}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          id="lightbox-image"
          src={src}
          alt={alt}
          className="max-w-full max-h-[95vh] object-contain select-none transition-transform duration-200"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
            touchAction: 'none'
          }}
          onWheel={handleWheel}
          draggable={false}
        />
      </div>

      {/* Zoom indicator */}
      {scale > 1 && (
        <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[10001] bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm transition-all duration-300 ${
          isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  );
}
