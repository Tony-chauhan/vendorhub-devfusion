'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { RefreshCw, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import StoreInfo from '@/components/admin/StoreInfo';
import { getAllStores, processVendorPayout } from '@/app/actions/admin';

interface DirectoryStore {
  id: string;
  name: string;
  description: string;
  username: string;
  address: string;
  logo: string | null;
  email: string;
  contact: string;
  createdAt: string;
  status: string;
  commission: number;
  user: { name: string; email: string; image: string | null };
}

export default function AdminStores() {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<DirectoryStore[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await getAllStores();
      if (res.success && res.stores) {
        setStores(
          res.stores.map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description || '',
            username: s.vendor?.name?.toLowerCase().replace(/\s+/g, '') || 'vendor',
            address: s.location,
            logo: s.logo,
            email: s.vendor?.email || '',
            contact: '—',
            createdAt: s.createdAt?.toString?.() ?? s.createdAt,
            status: s.status,
            commission: s.commission,
            user: { name: s.vendor?.name || 'Vendor', email: s.vendor?.email || '', image: null },
          }))
        );
      } else {
        toast.error(res.error || 'Failed to load stores');
      }
      setLoading(false);
    };
    load();
  }, []);

  const handlePayout = (storeId: string, storeName: string) => {
    startTransition(async () => {
      const res = await processVendorPayout(storeId);
      if (!res.success) {
        toast.error(res.error || 'Failed to process payout');
        return;
      }
      toast.success(
        `Payout of ${res.payout?.amount ?? 0} recorded for ${storeName}${
          res.pendingManualTransfer ? ' (pending manual bank transfer)' : ''
        }`
      );
    });
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Registered Storefronts
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Directory of every store on the platform, and manual payout processing for approved vendors
          </p>
        </div>
        {(loading || isPending) && <RefreshCw className="w-5 h-5 text-indigo-650 animate-spin" />}
      </div>

      {!loading && stores.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 max-w-4xl">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-end gap-6 hover:shadow-md transition-shadow duration-300"
            >
              <StoreInfo store={store as any} />

              <div className="flex flex-col items-start md:items-end gap-2 pt-4 md:pt-0 shrink-0 border-t border-slate-100 md:border-t-0 w-full md:w-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Commission: {store.commission}%
                </span>
                {store.status === 'APPROVED' && (
                  <button
                    onClick={() => handlePayout(store.id, store.name)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-full shadow-md cursor-pointer active:scale-95 transition-all"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Process Payout</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : !loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-lg shadow-sm">
          <h4 className="text-sm font-extrabold text-slate-700">No Stores Registered</h4>
        </div>
      ) : null}
    </div>
  );
}
