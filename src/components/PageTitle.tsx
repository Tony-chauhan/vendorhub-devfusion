'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PageTitleProps {
  heading: string;
  text: string;
  path?: string;
  linkText?: string;
}

export default function PageTitle({ heading, text, path = '/', linkText }: PageTitleProps) {
  return (
    <div className="my-8 space-y-1">
      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
        {heading}
      </h1>
      <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-500">
        <span>{text}</span>
        {linkText && path && (
          <>
            <span className="text-slate-300">•</span>
            <Link
              href={path}
              className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-700 font-bold group"
            >
              <span>{linkText}</span>
              <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
