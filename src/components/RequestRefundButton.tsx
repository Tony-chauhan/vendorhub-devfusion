'use client';

import React, { useState, useTransition } from 'react';
import { Undo2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { requestRefund } from '@/app/actions/orders';

export default function RequestRefundButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-center">
        Refund request submitted — an admin will review it shortly.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
      >
        <Undo2 className="w-3.5 h-3.5" /> Request Refund
      </button>
    );
  }

  const submit = () => {
    if (reason.trim().length < 10) {
      toast.error('Please describe the issue in at least 10 characters');
      return;
    }
    startTransition(async () => {
      const res = await requestRefund(orderId, reason.trim());
      if (!res.success) {
        toast.error(res.error || 'Failed to submit refund request');
        return;
      }
      toast.success('Refund request submitted');
      setSubmitted(true);
    });
  };

  return (
    <div className="flex flex-col gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-3.5">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        Why are you requesting a refund?
      </label>
      <textarea
        rows={3}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="E.g. item arrived damaged, wrong product delivered..."
        className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
      />
      <div className="flex gap-2">
        <button
          onClick={submit}
          disabled={isPending}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg cursor-pointer transition-all"
        >
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Undo2 className="w-3.5 h-3.5" />}
          Submit Request
        </button>
        <button
          onClick={() => setOpen(false)}
          className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-500 font-bold text-xs rounded-lg cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
