'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface TitleProps {
  title: string;
  description: string;
  visibleButton?: boolean;
  href?: string;
}

export default function Title({ title, description, visibleButton = true, href = '' }: TitleProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-2 mb-10">
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
        {title}
      </h2>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-500 max-w-xl">
        <p className="leading-relaxed">{description}</p>
        {visibleButton && href && (
          <Link
            href={href}
            className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 font-semibold group transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}
