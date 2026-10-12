import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  score: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export const StarRating: React.FC<StarRatingProps> = ({
  score,
  maxStars = 3,
  size = 'md',
  interactive = false,
  onChange,
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-8 h-8',
  };

  return (
    <div className="inline-flex items-center gap-1.5" aria-label={`${score} out of ${maxStars} stars`}>
      {Array.from({ length: maxStars }).map((_, idx) => {
        const starNum = idx + 1;
        const isFilled = starNum <= score;

        return (
          <button
            key={idx}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange && onChange(starNum)}
            className={`transition-all ${interactive ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled
                  ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                  : 'text-slate-700 fill-slate-900/50'
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
};
