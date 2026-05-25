'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { storesDummyData } from '@/assets/assets';
import StoreInfo from '@/components/admin/StoreInfo';

export default function AdminApprove() {
  const [isPending, startTransition] = useTransition();
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    // Show stores that are pending review
    const pendingStores = storesDummyData.map((s) => ({
      ...s,
      status: s.id === 'cmemkqnzm000htat8u7n8cpte' ? 'pending' : s.status,
    }));
    setStores(pendingStores);
  }, []);

  const handleApprove = (storeId: string, nextStatus: 'approved' | 'rejected') => {
    startTransition(async () => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      setStores((prev) =>
        prev.map((s) => {
          if (s.id === storeId) {
            toast.success(`Store registration request successfully: ${nextStatus.toUpperCase()}`);
            return { ...s, status: nextStatus };
          }
          return s;
        })
      );
    });
  };

  const pendingList = stores.filter((s) => s.status === 'pending');

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Moderate Store Requests
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Audit store applications, verify contact details, and approve or reject submissions
          </p>
        </div>
        {isPending && <RefreshCw className="w-5 h-5 text-indigo-650 animate-spin" />}
      </div>

      {pendingList.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 max-w-4xl">
          {pendingList.map((store) => (
            <div
              key={store.id}
              className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-end gap-6 hover:shadow-md transition-shadow duration-300"
            >
              {/* Store Info */}
              <StoreInfo store={store} />

              {/* Approval Buttons */}
              <div className="flex items-center space-x-3 pt-4 md:pt-0 shrink-0 border-t border-slate-100 md:border-t-0 w-full md:w-auto">
                <button
                  onClick={() => handleApprove(store.id, 'approved')}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md shadow-emerald-650/10 cursor-pointer flex items-center space-x-1 hover:scale-[1.01] active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Approve Registration</span>
                </button>
                <button
                  onClick={() => handleApprove(store.id, 'rejected')}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-full border border-slate-200 cursor-pointer flex items-center space-x-1 hover:scale-[1.01] active:scale-95 transition-all"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-250 rounded-3xl p-12 text-center max-w-lg shadow-sm flex flex-col items-center justify-center space-y-3">
          <span className="text-3xl">🎉</span>
          <h4 className="text-sm font-extrabold text-slate-700">No Store Requests Pending</h4>
          <p className="text-xs text-slate-400 font-semibold max-w-xs leading-relaxed">
            All merchant applications have been processed and approved. We are fully caught up!
          </p>
        </div>
      )}
    </div>
  );
}
