'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import StoreNavbar from './StoreNavbar';
import StoreSidebar from './StoreSidebar';
import { dummyStoreData } from '@/assets/assets';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);
  const [storeInfo, setStoreInfo] = useState<any>(null);

  useEffect(() => {
    // Simulate fetching seller status
    setTimeout(() => {
      setIsSeller(true);
      setStoreInfo(dummyStoreData);
      setLoading(false);
    }, 600);
  }, []);

  return loading ? (
    <div className="flex flex-col min-h-screen bg-slate-50 justify-center items-center">
      <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
      <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
        Loading Merchant Workspace...
      </p>
    </div>
  ) : isSeller ? (
    <div className="flex flex-col h-screen bg-slate-50">
      <StoreNavbar />
      <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
        <StoreSidebar storeInfo={storeInfo} />
        <main className="flex-1 h-full p-6 sm:p-10 overflow-y-scroll no-scrollbar animate-in fade-in duration-300">
          {children}
        </main>
      </div>
    </div>
  ) : (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6 space-y-4">
      <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">Workspace Authorization Denied</h1>
      <p className="text-xs text-slate-400 font-semibold max-w-sm">
        Only verified hyperlocal store owners have credentials to access merchant dashboard interfaces.
      </p>
      <Link
        href="/"
        className="inline-flex items-center space-x-1.5 px-6 py-3 bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold rounded-full shadow-md cursor-pointer transition-transform hover:scale-[1.01]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Shopping Home</span>
      </Link>
    </div>
  );
}
