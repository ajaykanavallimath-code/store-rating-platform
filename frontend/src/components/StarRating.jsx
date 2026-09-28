import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({
  rating = 0,
  maxStars = 5,
  size = 'md',
  readOnly = false,
  onChange = () => {},
  showValue = true,
  className = ''
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-9 h-9'
  };

  const starSize = sizeClasses[size] || sizeClasses.md;

  const handleClick = (value) => {
    if (!readOnly && onChange) {
      onChange(value);
    }
  };

  const handleKeyDown = (e, value) => {
    if (readOnly) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(value);
    }
  };

  const effectiveRating = hoverRating || rating;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div 
        className="flex items-center gap-0.5" 
        role={readOnly ? 'img' : 'radiogroup'} 
        aria-label={`Rating: ${rating} out of ${maxStars} stars`}
        onMouseLeave={() => !readOnly && setHoverRating(0)}
      >
        {Array.from({ length: maxStars }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= effectiveRating;
          const isPartial = !isFilled && starValue - 0.5 <= effectiveRating;

          return (
            <button
              key={starValue}
              type="button"
              disabled={readOnly}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => !readOnly && setHoverRating(starValue)}
              onKeyDown={(e) => handleKeyDown(e, starValue)}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
              className={`transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded p-0.5 ${
                readOnly 
                  ? 'cursor-default' 
                  : 'cursor-pointer hover:scale-110 active:scale-95'
              }`}
            >
              <Star
                className={`${starSize} transition-colors ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : isPartial
                    ? 'text-amber-400 fill-amber-200'
                    : 'text-slate-300 fill-slate-100 hover:text-amber-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className={`font-semibold text-slate-700 ${size === 'lg' ? 'text-lg' : 'text-sm'}`}>
          {rating > 0 ? Number(rating).toFixed(1) : (readOnly ? 'No ratings' : '')}
        </span>
      )}
    </div>
  );
};

export default StarRating;
