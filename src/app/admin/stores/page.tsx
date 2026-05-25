'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { storesDummyData } from '@/assets/assets';
import StoreInfo from '@/components/admin/StoreInfo';

export default function AdminStores() {
  const [isPending, startTransition] = useTransition();
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    setStores(storesDummyData);
  }, []);

  const toggleIsActive = (storeId: string) => {
    startTransition(async () => {
      // Simulate API call toggle
      await new Promise((resolve) => setTimeout(resolve, 800));

      setStores((prev) =>
        prev.map((s) => {
          if (s.id === storeId) {
            const nextActive = !s.isActive;
            toast.success(
              `Store status updated: ${s.name} is now ${nextActive ? 'Active' : 'Suspended'}`
            );
            return { ...s, isActive: nextActive };
          }
          return s;
        })
      );
    });
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Registered Storefronts
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Audit live hyperlocal merchants, toggle store activation bounds, and manage parameters
          </p>
        </div>
        {isPending && <RefreshCw className="w-5 h-5 text-indigo-650 animate-spin" />}
      </div>

      {stores.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 max-w-4xl">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-end gap-6 hover:shadow-md transition-shadow duration-300"
            >
              {/* Store Info */}
              <StoreInfo store={store} />

              {/* Actions toggle */}
              <div className="flex items-center space-x-2.5 pt-4 md:pt-0 shrink-0 border-t border-slate-100 md:border-t-0 w-full md:w-auto">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Store Status
                </span>
                <button
                  onClick={() => toggleIsActive(store.id)}
                  className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-full font-bold cursor-pointer transition-colors ${
                    store.isActive
                      ? 'text-emerald-700 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100'
                      : 'text-rose-700 bg-rose-50 border border-rose-100 hover:bg-rose-100'
                  }`}
                >
                  {store.isActive ? (
                    <>
                      <ToggleRight className="w-4 h-4" />
                      <span className="text-[9px] uppercase tracking-wider">Active</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4" />
                      <span className="text-[9px] uppercase tracking-wider">Suspended</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-lg shadow-sm">
          <h4 className="text-sm font-extrabold text-slate-700">No Stores Registered</h4>
        </div>
      )}
    </div>
  );
}
