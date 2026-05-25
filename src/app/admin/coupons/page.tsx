'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { RefreshCw, Percent, Ticket, Trash2, Calendar, UserCheck, Users, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { couponDummyData } from '@/assets/assets';

export default function AdminCoupons() {
  const [isPending, startTransition] = useTransition();

  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discount: '',
    forNewUser: false,
    forMember: false,
    isPublic: false,
    expiresAt: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    setCoupons(couponDummyData);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setNewCoupon({ ...newCoupon, [e.target.name]: e.target.value });
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newCoupon.code || !newCoupon.discount || !newCoupon.description) {
      toast.error('Please enter a Coupon Code, Discount percentage, and Description.');
      return;
    }

    startTransition(async () => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      const couponObj = {
        code: newCoupon.code.toUpperCase(),
        description: newCoupon.description,
        discount: Number(newCoupon.discount),
        forNewUser: newCoupon.forNewUser,
        forMember: newCoupon.forMember,
        isPublic: newCoupon.isPublic,
        expiresAt: new Date(newCoupon.expiresAt).toISOString(),
      };

      setCoupons((prev) => [couponObj, ...prev]);

      // Reset Form fields
      setNewCoupon({
        code: '',
        description: '',
        discount: '',
        forNewUser: false,
        forMember: false,
        isPublic: false,
        expiresAt: new Date().toISOString().split('T')[0],
      });

      toast.success(`Coupon code "${couponObj.code}" created successfully!`);
    });
  };

  const deleteCoupon = (code: string) => {
    startTransition(async () => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      setCoupons((prev) => prev.filter((c) => c.code !== code));
      toast.success(`Coupon code "${code}" deleted successfully!`);
    });
  };

  return (
    <div className="space-y-8 pb-24 max-w-4xl animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Moderate Promo Coupons
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Create discount coupon codes, configure user targeting parameters, and audit live promotions
          </p>
        </div>
        {isPending && <RefreshCw className="w-5 h-5 text-indigo-650 animate-spin" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Create Coupon Form */}
        <form
          onSubmit={handleAddCoupon}
          className="lg:col-span-5 bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 text-xs font-semibold text-slate-500"
        >
          <div className="flex items-center space-x-2 text-xs font-black text-indigo-700 uppercase tracking-widest border-b border-slate-100 pb-3">
            <Ticket className="w-4 h-4 text-indigo-600" />
            <span>Create Promo Coupon</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Code */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Coupon Code
              </label>
              <input
                type="text"
                name="code"
                placeholder="e.g. SUMMER50"
                value={newCoupon.code}
                onChange={handleChange}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 transition-all font-semibold placeholder:text-slate-400"
                required
              />
            </div>

            {/* Discount */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                min={1}
                max={100}
                placeholder="e.g. 20"
                value={newCoupon.discount}
                onChange={handleChange}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 transition-all font-semibold placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Description Curation
            </label>
            <input
              type="text"
              name="description"
              placeholder="e.g. 20% off for verified plus members"
              value={newCoupon.description}
              onChange={handleChange}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 transition-all font-semibold placeholder:text-slate-400"
              required
            />
          </div>

          {/* Expiry date */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Promo Expiration Date
            </label>
            <div className="relative">
              <input
                type="date"
                name="expiresAt"
                value={newCoupon.expiresAt}
                onChange={handleChange}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 transition-all font-semibold"
                required
              />
            </div>
          </div>

          {/* Toggle Targeting */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              User targeting
            </span>
            <div className="space-y-2">
              <label className="flex items-center space-x-2.5 cursor-pointer p-2 hover:bg-slate-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={newCoupon.forNewUser}
                  onChange={(e) => setNewCoupon({ ...newCoupon, forNewUser: e.target.checked })}
                  className="accent-indigo-650"
                />
                <span className="text-[11px] font-bold text-slate-600">Restrict to New Registrations Only</span>
              </label>
              <label className="flex items-center space-x-2.5 cursor-pointer p-2 hover:bg-slate-50 rounded-xl">
                <input
                  type="checkbox"
                  checked={newCoupon.forMember}
                  onChange={(e) => setNewCoupon({ ...newCoupon, forMember: e.target.checked })}
                  className="accent-indigo-650"
                />
                <span className="text-[11px] font-bold text-slate-600">Restrict to Plus Premium Members</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-full shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>Generate Promo Coupon</span>
          </button>
        </form>

        {/* Right Side: List Coupons */}
        <div className="lg:col-span-7 flex flex-col space-y-4">
          <div className="flex items-center space-x-2 text-xs font-black text-slate-600 uppercase tracking-widest">
            <Percent className="w-4 h-4 text-indigo-500" />
            <span>Active Promotion Database</span>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 pl-5 text-left">Code</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-center">Cut %</th>
                  <th className="px-4 py-3 text-center">Expires At</th>
                  <th className="px-4 py-3 text-center">Targeting</th>
                  <th className="px-4 py-3 text-center pr-5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-650">
                {coupons.map((coupon) => (
                  <tr key={coupon.code} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-4 py-3 pl-5 font-black text-slate-800 tracking-tight">
                      {coupon.code}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-500 max-w-[130px] truncate">
                      {coupon.description}
                    </td>
                    <td className="px-4 py-3 text-center font-extrabold text-indigo-600">
                      {coupon.discount}%
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-400">
                      {new Date(coupon.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-550">
                      <div className="flex items-center justify-center gap-1.5">
                        {coupon.forNewUser && (
                          <span
                            title="New registrations only"
                            className="px-1.5 py-0.5 text-[8px] font-black uppercase text-indigo-700 bg-indigo-50 rounded"
                          >
                            New
                          </span>
                        )}
                        {coupon.forMember && (
                          <span
                            title="Plus Premium members only"
                            className="px-1.5 py-0.5 text-[8px] font-black uppercase text-amber-700 bg-amber-50 rounded"
                          >
                            Plus
                          </span>
                        )}
                        {!coupon.forNewUser && !coupon.forMember && (
                          <span className="text-[9px] text-slate-350 font-bold uppercase">All</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center pr-5">
                      <button
                        onClick={() => deleteCoupon(coupon.code)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-full cursor-pointer transition-colors active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
