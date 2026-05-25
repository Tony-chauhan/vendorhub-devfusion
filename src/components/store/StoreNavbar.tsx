'use client';

import React from 'react';
import Link from 'next/link';
import { useCustomUser } from '@/lib/clerk-client';

export default function StoreNavbar() {
  const { user } = useCustomUser();

  return (
    <div className="flex items-center justify-between px-6 sm:px-12 py-4 bg-white border-b border-slate-200 transition-all z-20 shadow-sm">
      <Link href="/" className="relative flex items-center group">
        <span className="text-2xl font-extrabold tracking-tight text-slate-900">
          Vendor<span className="text-indigo-600">Hub</span>
          <span className="text-indigo-600 font-black">.</span>
        </span>
        <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-650 bg-indigo-50 border border-indigo-150 rounded">
          Merchant
        </span>
      </Link>
      <div className="flex items-center space-x-3 text-xs font-bold text-slate-700">
        <div className="w-7 h-7 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center font-black text-indigo-700 uppercase">
          {user?.firstName ? user.firstName.charAt(0) : 'M'}
        </div>
        <span>Hi, {user?.firstName || 'Seller'}</span>
      </div>
    </div>
  );
}
