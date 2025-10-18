import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  showLabel?: boolean;
}

export default function StarRating({
  rating,
  onRatingChange,
  maxRating = 5,
  size = 'md',
  interactive = true,
  showLabel = true
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const getRatingLabel = (rating: number) => {
    const labels = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very Good',
      5: 'Excellent'
    };
    return labels[rating as keyof typeof labels] || '';
  };

  const handleStarClick = (starRating: number) => {
    if (interactive) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (interactive) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-1">
        {Array.from({ length: maxRating }, (_, index) => {
          const starRating = index + 1;
          const isFilled = starRating <= (hoverRating || rating);
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleStarClick(starRating)}
              onMouseEnter={() => handleStarHover(starRating)}
              onMouseLeave={handleMouseLeave}
              disabled={!interactive}
              className={cn(
                'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 rounded',
                interactive && 'hover:scale-110 transform transition-transform duration-200',
                !interactive && 'cursor-default'
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 fill-gray-300',
                  interactive && 'hover:text-yellow-500 hover:fill-yellow-500'
                )}
              />
            </button>
          );
        })}
      </div>
      
      {showLabel && rating > 0 && (
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
          {getRatingLabel(rating)}
        </p>
      )}
      
      {interactive && rating === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Click to rate your experience
        </p>
      )}
    </div>
  );
}
