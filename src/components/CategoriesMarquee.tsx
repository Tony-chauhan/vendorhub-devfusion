'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { categories } from '@/assets/assets';

export default function CategoriesMarquee() {
  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    router.push(`/shop?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="overflow-hidden w-full relative max-w-7xl mx-auto select-none group my-12 sm:my-16">
      {/* Soft glass gradients to fade edges */}
      <div className="absolute left-0 top-0 h-full w-12 sm:w-24 z-10 pointer-events-none bg-gradient-to-r from-slate-50 to-transparent" />
      <div className="absolute right-0 top-0 h-full w-12 sm:w-24 z-10 pointer-events-none bg-gradient-to-l from-slate-50 to-transparent" />

      {/* Repeating category elements with CSS translation marquee */}
      <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused] gap-4">
        {[...categories, ...categories, ...categories, ...categories, ...categories, ...categories].map((cat, idx) => (
          <button
            key={idx}
            onClick={() => handleCategoryClick(cat)}
            className="px-6 py-2.5 bg-white/70 hover:bg-indigo-600 hover:text-white border border-slate-200/60 hover:border-indigo-600 rounded-full text-slate-700 text-xs sm:text-sm font-semibold shadow-sm hover:shadow-indigo-600/10 active:scale-95 transition-all duration-300 cursor-pointer"
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
