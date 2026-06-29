'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { storesDummyData } from '@/assets/assets';
import StoreInfo from '@/components/admin/StoreInfo';
import { getPendingStores, updateStoreStatus } from '@/app/actions/admin';

export default function AdminApprove() {
  const [isPending, startTransition] = useTransition();
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    const fetchStores = async () => {
      // 1. Try to fetch pending stores from database
      try {
        const res = await getPendingStores();
        if (res.success && res.stores && res.stores.length > 0) {
          const dbStores = res.stores.map((s: any) => ({
            id: s.id,
            name: s.name,
            description: s.description || "",
            username: s.vendor?.name?.toLowerCase().replace(/\s+/g, "") || "vendor",
            address: s.location,
            logo: s.logo,
            email: s.vendor?.email || "",
            contact: "+91 99999 99999",
            createdAt: s.createdAt.toString(),
            status: s.status.toLowerCase(),
            user: {
              name: s.vendor?.name || "Vendor",
              email: s.vendor?.email || "",
              image: null,
            }
          }));
          setStores(dbStores);
          return;
        }
      } catch (err) {
        console.error("Error loading stores from database, falling back:", err);
      }

      // 2. Check localStorage for mock simulated store application
      const mockStoreStr = localStorage.getItem("vendorhub_mock_store");
      if (mockStoreStr) {
        const mockStore = JSON.parse(mockStoreStr);
        if (mockStore.status === "PENDING") {
          const formattedMockStore = {
            id: mockStore.id || "mock_store_id",
            name: mockStore.name,
            description: mockStore.description || "",
            username: mockStore.username || "dharmender",
            address: mockStore.location,
            logo: mockStore.logo,
            email: mockStore.email || "dharmenderchauhan802@gmail.com",
            contact: mockStore.contact || "+91 98765 43210",
            createdAt: mockStore.createdAt || new Date().toISOString(),
            status: mockStore.status.toLowerCase(),
            user: mockStore.user || {
              name: "Dharmender Chauhan",
              email: "dharmenderchauhan802@gmail.com",
              image: null,
            }
          };
          setStores([formattedMockStore]);
          return;
        }
      }

      // 3. Fallback dummy data mapped to status: pending for demonstration
      const pendingStores = storesDummyData.map((s) => ({
        ...s,
        status: s.id === 'cmemkqnzm000htat8u7n8cpte' ? 'pending' : s.status,
      }));
      setStores(pendingStores);
    };

    fetchStores();
  }, []);

  const handleApprove = (storeId: string, nextStatus: 'approved' | 'rejected') => {
    startTransition(async () => {
      try {
        // If it's a real database store ID (does not start with 'mock_') and we're in DB mode, update it
        if (!storeId.startsWith("mock_") && storeId !== "cmemkqnzm000htat8u7n8cpte") {
          const res = await updateStoreStatus(storeId, nextStatus === "approved" ? "APPROVED" : "REJECTED");
          if (!res.success) {
            toast.error(res.error || "Failed to update store status");
            return;
          }
        } else {
          // If it is the mock store in localStorage, update it!
          const mockStoreStr = localStorage.getItem("vendorhub_mock_store");
          if (mockStoreStr) {
            const mockStore = JSON.parse(mockStoreStr);
            if (mockStore.id === storeId || storeId === "mock_store_id") {
              mockStore.status = nextStatus.toUpperCase();
              localStorage.setItem("vendorhub_mock_store", JSON.stringify(mockStore));
              
              // Promote user role to VENDOR if approved
              if (nextStatus === "approved") {
                localStorage.setItem("vendorhub_mock_user_role", "VENDOR");
              }
            }
          }
        }

        toast.success(`Store registration request successfully: ${nextStatus.toUpperCase()}`);
        setStores((prev) =>
          prev.map((s) => (s.id === storeId ? { ...s, status: nextStatus } : s))
        );
      } catch (err: any) {
        toast.error("Failed to update status: " + err.message);
      }
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
