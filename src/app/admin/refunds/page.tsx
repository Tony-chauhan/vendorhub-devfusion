'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { RefreshCw, CheckCircle2, XCircle, Undo2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getRefundRequests, processRefund } from '@/app/actions/admin';

interface RefundRow {
  id: string;
  reason: string;
  status: string;
  createdAt: string;
  order: {
    orderNumber: string;
    totalAmount: number;
    buyer: { name: string | null; email: string };
  };
}

export default function AdminRefunds() {
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [refunds, setRefunds] = useState<RefundRow[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await getRefundRequests();
      if (res.success && res.refunds) {
        setRefunds(res.refunds as any);
      } else {
        toast.error(res.error || 'Failed to load refund requests');
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleDecision = (refundId: string, status: 'APPROVED' | 'REJECTED') => {
    startTransition(async () => {
      const res = await processRefund(refundId, status);
      if (!res.success) {
        toast.error(res.error || 'Failed to update refund');
        return;
      }
      toast.success(`Refund ${status === 'APPROVED' ? 'approved' : 'rejected'}`);
      setRefunds((prev) => prev.map((r) => (r.id === refundId ? { ...r, status } : r)));
    });
  };

  const pendingRefunds = refunds.filter((r) => r.status === 'PENDING');
  const decidedRefunds = refunds.filter((r) => r.status !== 'PENDING');

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Refund Requests</h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Review buyer-submitted refund requests for delivered orders
          </p>
        </div>
        {(loading || isPending) && <RefreshCw className="w-5 h-5 text-indigo-650 animate-spin" />}
      </div>

      {!loading && pendingRefunds.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 max-w-4xl">
          {pendingRefunds.map((refund) => (
            <div
              key={refund.id}
              className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-800 text-sm">{refund.order.orderNumber}</span>
                  <span className="px-2.5 py-0.5 text-[9px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-100 rounded-full">
                    Pending
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold">
                  {refund.order.buyer.name || refund.order.buyer.email} — ₹{refund.order.totalAmount.toFixed(2)}
                </p>
                <p className="text-xs text-slate-600 italic">&quot;{refund.reason}&quot;</p>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleDecision(refund.id, 'APPROVED')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-full shadow-md cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => handleDecision(refund.id, 'REJECTED')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-full border border-slate-200 cursor-pointer flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : !loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-lg shadow-sm flex flex-col items-center gap-2">
          <Undo2 className="w-7 h-7 text-slate-300" />
          <h4 className="text-sm font-extrabold text-slate-700">No Pending Refund Requests</h4>
        </div>
      ) : null}

      {decidedRefunds.length > 0 && (
        <div className="space-y-3 max-w-4xl">
          <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Decided</h2>
          <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 pl-5">Order</th>
                  <th className="px-4 py-3">Buyer</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3 pr-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {decidedRefunds.map((refund) => (
                  <tr key={refund.id}>
                    <td className="px-4 py-3 pl-5 font-bold text-slate-700">{refund.order.orderNumber}</td>
                    <td className="px-4 py-3 text-slate-500">{refund.order.buyer.name || refund.order.buyer.email}</td>
                    <td className="px-4 py-3 text-slate-500 max-w-[240px] truncate">{refund.reason}</td>
                    <td className="px-4 py-3 pr-5 text-right">
                      <span
                        className={`px-2.5 py-0.5 text-[9px] font-black uppercase rounded-full border ${
                          refund.status === 'APPROVED'
                            ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                            : 'text-rose-700 bg-rose-50 border-rose-100'
                        }`}
                      >
                        {refund.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
