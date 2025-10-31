import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  totalRatings?: number;
  size?: number;
  showCount?: boolean;
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export default function StarRating({ 
  rating, 
  totalRatings = 0, 
  size = 16, 
  showCount = true,
  interactive = false,
  onRate
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = React.useState(0);
  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  const handleClick = (value: number) => {
    if (interactive && onRate) {
      onRate(value);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            disabled={!interactive}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <Star
              size={size}
              className={`${
                star <= displayRating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
      {showCount && totalRatings > 0 && (
        <span className="text-sm text-gray-600">
          {rating.toFixed(1)} ({totalRatings})
        </span>
      )}
    </div>
  );
}
