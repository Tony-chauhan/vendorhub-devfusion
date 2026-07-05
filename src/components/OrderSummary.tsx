'use client';

import React, { useState } from 'react';
import { ShieldCheck, Ticket, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { couponDummyData } from '@/assets/assets';

interface OrderSummaryProps {
  totalPrice: number;
  items: any[];
}

export default function OrderSummary({ totalPrice, items }: OrderSummaryProps) {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
  const router = useRouter();

  // Component local states
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [coupon, setCoupon] = useState<any>(null);

  const handleCouponCode = (event: React.FormEvent) => {
    event.preventDefault();
    if (!couponCodeInput.trim()) return;

    const matched = couponDummyData.find(
      (c) => c.code.toLowerCase() === couponCodeInput.trim().toLowerCase()
    );

    if (matched) {
      setCoupon(matched);
      toast.success(`Coupon Applied: ${matched.description}`);
      setCouponCodeInput('');
    } else {
      toast.error('Invalid coupon code! Try "NEW20", "PLUS10", or "OFF20"');
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();

    // The real checkout flow (shipping form, payment gateway, order creation)
    // lives on /checkout. Carry the applied coupon along so the discount stays
    // consistent instead of resetting on the next page.
    toast.success('Redirecting to secure checkout...');
    const query = coupon ? `?coupon=${encodeURIComponent(coupon.code)}` : '';
    router.push(`/checkout${query}`);
  };

  // Discount Math
  const discountAmount = coupon ? (coupon.discount / 100) * totalPrice : 0;
  const finalPrice = totalPrice - discountAmount;

  return (
    <div className="w-full max-w-lg lg:max-w-[350px] bg-white border border-slate-205 text-xs text-slate-500 rounded-3xl p-6 sm:p-8 shadow-md flex flex-col space-y-5 animate-in fade-in duration-300">
      <h2 className="text-base font-extrabold text-slate-800">Order Summary</h2>

      {/* Payment Method Note */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Payment Method
        </span>
        <p className="text-[11px] text-slate-500 font-semibold bg-slate-50/50 border border-slate-150 rounded-2xl p-3">
          Choose Razorpay or Cash on Delivery on the next step.
        </p>
      </div>

      {/* Bill Breakdown */}
      <div className="border-t border-slate-100 pt-4 space-y-2.5">
        <div className="flex justify-between items-center text-slate-400 font-semibold">
          <span>Subtotal</span>
          <span className="text-slate-800 font-black">
            {currency}
            {totalPrice.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-400 font-semibold">
          <span>Hyperlocal Delivery</span>
          <span className="text-emerald-600 font-extrabold uppercase">FREE</span>
        </div>

        {coupon && (
          <div className="flex justify-between items-center text-indigo-600 font-semibold bg-indigo-50/50 border border-indigo-100 p-2.5 rounded-2xl">
            <span className="flex items-center space-x-1">
              <Ticket className="w-3.5 h-3.5 text-indigo-500" />
              <span>Coupon ({coupon.code})</span>
            </span>
            <span className="font-black text-indigo-700">
              -{currency}
              {discountAmount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Coupon Code Form */}
        {!coupon ? (
          <form onSubmit={handleCouponCode} className="flex gap-2 pt-1.5">
            <input
              type="text"
              placeholder="e.g. NEW20"
              value={couponCodeInput}
              onChange={(e) => setCouponCodeInput(e.target.value)}
              className="flex-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 transition-all font-semibold placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
            >
              Apply
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between bg-indigo-50/40 p-2.5 rounded-2xl border border-indigo-100/50">
            <div>
              <p className="text-[10px] font-black text-indigo-700 uppercase">{coupon.code}</p>
              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{coupon.description}</p>
            </div>
            <button
              onClick={() => setCoupon(null)}
              className="text-slate-400 hover:text-rose-500 p-1 rounded-full cursor-pointer hover:bg-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Bill total & trigger button */}
      <div className="border-t border-slate-100 pt-4 flex flex-col space-y-4">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-black text-slate-700">Total Bill Amount</span>
          <span className="text-xl font-black text-indigo-600 tracking-tight">
            {currency}
            {finalPrice.toFixed(2)}
          </span>
        </div>

        <button
          onClick={handlePlaceOrder}
          className="w-full py-3.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-full shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-2"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-450" />
          <span>Confirm & Place Order</span>
        </button>
      </div>
    </div>
  );
}
