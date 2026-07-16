'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { RefreshCw, CheckCircle2, XCircle, BadgeCheck, BadgeX, ShieldQuestion } from 'lucide-react';
import toast from 'react-hot-toast';
import StoreInfo from '@/components/admin/StoreInfo';
import { getPendingStores, updateStoreStatus, verifyVendorStore } from '@/app/actions/admin';

interface PendingStore {
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
  gstNumber: string | null;
  panNumber: string | null;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  verificationStatus: string;
  verificationNotes: string | null;
  user: { name: string; email: string; image: string | null };
}

export default function AdminApprove() {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState<PendingStore[]>([]);

  const loadStores = async () => {
    setLoading(true);
    try {
      const res = await getPendingStores();
      if (res.success && res.stores) {
        setStores(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            gstNumber: s.gstNumber,
            panNumber: s.panNumber,
            bankAccountNumber: s.bankAccountNumber,
            bankIfsc: s.bankIfsc,
            verificationStatus: s.verificationStatus,
            verificationNotes: s.verificationNotes,
            user: {
              name: s.vendor?.name || 'Vendor',
              email: s.vendor?.email || '',
              image: null,
            },
          }))
        );
      } else {
        toast.error(res.error || 'Failed to load pending stores');
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || 'Failed to load pending stores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStores();
  }, []);

  const handleApprove = (storeId: string, nextStatus: 'APPROVED' | 'REJECTED') => {
    startTransition(async () => {
      const res = await updateStoreStatus(storeId, nextStatus);
      if (!res.success) {
        toast.error(res.error || 'Failed to update store status');
        return;
      }
      toast.success(`Store ${nextStatus === 'APPROVED' ? 'approved' : 'rejected'}`);
      setStores((prev) => prev.filter((s) => s.id !== storeId));
    });
  };

  const handleVerify = (storeId: string, verificationStatus: 'VERIFIED' | 'REJECTED') => {
    startTransition(async () => {
      const res = await verifyVendorStore(storeId, verificationStatus);
      if (!res.success) {
        toast.error(res.error || 'Failed to update verification status');
        return;
      }
      toast.success(`GST/PAN verification marked ${verificationStatus}`);
      setStores((prev) =>
        prev.map((s) => (s.id === storeId ? { ...s, verificationStatus } : s))
      );
    });
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Moderate Store Requests
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Audit store applications, verify GST/PAN details, and approve or reject submissions
          </p>
        </div>
        {(loading || isPending) && <RefreshCw className="w-5 h-5 text-indigo-650 animate-spin" />}
      </div>

      {!loading && stores.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 max-w-4xl">
          {stores.map((store) => (
            <div
              key={store.id}
              className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6 hover:shadow-md transition-shadow duration-300"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <StoreInfo store={store as any} />

                <div className="flex items-center space-x-3 pt-4 md:pt-0 shrink-0 border-t border-slate-100 md:border-t-0 w-full md:w-auto">
                  <button
                    onClick={() => handleApprove(store.id, 'APPROVED')}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md shadow-emerald-650/10 cursor-pointer flex items-center space-x-1 hover:scale-[1.01] active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve Registration</span>
                  </button>
                  <button
                    onClick={() => handleApprove(store.id, 'REJECTED')}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-full border border-slate-200 cursor-pointer flex items-center space-x-1 hover:scale-[1.01] active:scale-95 transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* GST/PAN/Bank verification panel */}
              <div className="bg-slate-50/60 border border-slate-150/60 rounded-2xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">GSTIN</span>
                  <span className="font-bold text-slate-700">{store.gstNumber || 'Not provided (small-seller exemption)'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">PAN</span>
                  <span className="font-bold text-slate-700">{store.panNumber || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bank Account</span>
                  <span className="font-bold text-slate-700">
                    {store.bankAccountNumber || '—'} {store.bankIfsc ? `(${store.bankIfsc})` : ''}
                  </span>
                </div>

                <div className="sm:col-span-3 flex items-center justify-between border-t border-slate-200/60 pt-4 mt-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${
                        store.verificationStatus === 'VERIFIED'
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                          : store.verificationStatus === 'REJECTED'
                            ? 'text-rose-700 bg-rose-50 border-rose-100'
                            : 'text-amber-700 bg-amber-50 border-amber-100'
                      }`}
                    >
                      Verification: {store.verificationStatus}
                    </span>
                    {store.verificationNotes && (
                      <span className="text-[10px] text-slate-400 font-semibold italic">{store.verificationNotes}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVerify(store.id, 'VERIFIED')}
                      className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-emerald-700 font-bold text-[10px] rounded-full cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <BadgeCheck className="w-3.5 h-3.5" /> Mark Verified
                    </button>
                    <button
                      onClick={() => handleVerify(store.id, 'REJECTED')}
                      className="px-3 py-1.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-700 font-bold text-[10px] rounded-full cursor-pointer flex items-center gap-1 transition-all"
                    >
                      <BadgeX className="w-3.5 h-3.5" /> Mark Rejected
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !loading ? (
        <div className="bg-white border border-slate-250 rounded-3xl p-12 text-center max-w-lg shadow-sm flex flex-col items-center justify-center space-y-3">
          <ShieldQuestion className="w-8 h-8 text-slate-300" />
          <h4 className="text-sm font-extrabold text-slate-700">No Store Requests Pending</h4>
          <p className="text-xs text-slate-400 font-semibold max-w-xs leading-relaxed">
            All merchant applications have been processed. We are fully caught up.
          </p>
        </div>
      ) : null}
    </div>
  );
}
