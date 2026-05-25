import { Star } from 'lucide-react';
import React from 'react';

interface RatingProps {
  value?: number;
}

export default function Rating({ value = 4 }: RatingProps) {
  return (
    <div className="flex items-center space-x-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`shrink-0 w-3.5 h-3.5 ${
            value > i ? 'text-amber-400 fill-amber-450' : 'text-slate-200'
          }`}
        />
      ))}
    </div>
  );
}
