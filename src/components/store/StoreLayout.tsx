'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw, Hourglass, ShieldAlert, XOctagon } from 'lucide-react';
import StoreNavbar from './StoreNavbar';
import StoreSidebar from './StoreSidebar';
import { getCurrentUserRoleAndStore } from '@/app/actions/vendors';

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const [isSeller, setIsSeller] = useState(false);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [storeInfo, setStoreInfo] = useState<any | null>(null);
  const [storeStatus, setStoreStatus] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkSellerStatus = async () => {
      try {
        const res = await getCurrentUserRoleAndStore();
        if (res.success) {
          const currentRole = res.role;
          const currentStore = res.store;
          const status = res.store?.status || null;

          if (currentRole === "ADMIN") {
            setIsSeller(true);
            setStoreInfo(currentStore || { name: "Platform Admin Store", logo: null });
            setStoreStatus("APPROVED");
          } else if (currentRole === "VENDOR" && currentStore) {
            setIsSeller(true);
            setStoreInfo(currentStore);
            setStoreStatus(status);
          } else {
            // Buyer or guest, redirect to registration onboarding
            router.push("/vendor/register");
          }
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error("Error checking seller layout:", err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    checkSellerStatus();
  }, [router]);

  return loading ? (
    <div className="flex flex-col min-h-screen bg-slate-50 justify-center items-center">
      <RefreshCw className="w-8 h-8 text-indigo-650 animate-spin mb-4" />
      <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
        Loading Merchant Workspace...
      </p>
    </div>
  ) : isSeller ? (
    storeStatus === "PENDING" ? (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6 space-y-6 font-sans relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-md w-full bg-white/80 border border-slate-200/80 p-8 sm:p-10 rounded-3xl backdrop-blur-md shadow-xl flex flex-col items-center text-center gap-6">
          <div className="bg-amber-50 p-4.5 rounded-full border border-amber-100 shadow-lg shadow-amber-500/5 animate-pulse">
            <Hourglass className="h-12 w-12 text-amber-500" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Application Under Review</h1>
            <p className="text-slate-550 text-xs leading-relaxed font-semibold">
              Your store <strong className="text-indigo-600">&quot;{storeInfo?.name}&quot;</strong> is currently awaiting administrative approval. Once approved, the full seller dashboard will unlock.
            </p>
          </div>

          <div className="w-full bg-indigo-50/80 border border-indigo-200/60 p-5 rounded-2xl flex flex-col gap-2 text-left text-xs">
            <h3 className="font-extrabold text-indigo-700 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-indigo-550" /> What happens next:
            </h3>
            <p className="text-slate-550 leading-relaxed font-semibold">
              A platform administrator will review your store details, GST/PAN information, and bank
              account before approving your application. You&apos;ll receive an email once a decision is made.
            </p>
          </div>

          <Link
            href="/"
            className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold py-3 rounded-xl transition-all text-center"
          >
            Back to Market
          </Link>
        </div>
      </div>
    ) : storeStatus === "REJECTED" ? (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6 space-y-6 font-sans relative overflow-hidden">
        <div className="max-w-md w-full bg-white/80 border border-slate-200/80 p-8 sm:p-10 rounded-3xl backdrop-blur-md shadow-xl flex flex-col items-center text-center gap-6">
          <div className="bg-rose-50 p-4.5 rounded-full border border-rose-100 shadow-lg">
            <XOctagon className="h-12 w-12 text-rose-500" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">Application Rejected</h1>
            <p className="text-slate-550 text-xs leading-relaxed font-semibold">
              Unfortunately, your application for <strong className="text-rose-600">&quot;{storeInfo?.name}&quot;</strong> did not pass our hyperlocal verification audits. Please contact support.
            </p>
          </div>

          <Link 
            href="/"
            className="w-full bg-slate-900 hover:bg-slate-950 text-white text-xs font-bold py-3 rounded-xl transition-all text-center"
          >
            Exit to Marketplace
          </Link>
        </div>
      </div>
    ) : (
      <div className="flex flex-col h-screen bg-slate-50">
        <StoreNavbar />
        <div className="flex flex-1 items-start h-full overflow-y-auto">
          <StoreSidebar storeInfo={storeInfo} />
          <main className="flex-1 h-full p-6 sm:p-10 overflow-y-auto animate-in fade-in duration-300">
            {children}
          </main>
        </div>
      </div>
    )
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

