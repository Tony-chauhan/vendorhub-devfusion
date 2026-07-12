'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, ListOrdered, Store, Package, Users, TrendingUp, Crown } from 'lucide-react';
import OrdersAreaChart from '@/components/OrdersAreaChart';

interface RecentOrderItem {
  id: string;
  orderNumber: string;
  buyerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface TopVendor {
  storeName: string;
  revenue: number;
  orderCount: number;
}

interface AdminDashboardClientProps {
  analytics: {
    totalSales: number;
    totalNet: number;
    platformCommission: number;
    activeVendors: number;
    pendingVendors: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
  };
  recentOrders: Array<{ createdAt: string; total: number }>;
  recentOrdersList?: RecentOrderItem[];
  topVendors?: TopVendor[];
}

const statusColor: Record<string, string> = {
  PLACED: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const },
  }),
};

export default function AdminDashboardClient({
  analytics,
  recentOrders,
  recentOrdersList = [],
  topVendors = [],
}: AdminDashboardClientProps) {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

  const stats = [
    { title: 'Platform Revenue', value: currency + analytics.totalSales.toLocaleString(), icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { title: 'Vendor Net Payouts', value: currency + analytics.totalNet.toLocaleString(), icon: ShoppingBag, color: 'text-indigo-650 bg-indigo-50 border-indigo-100' },
    { title: 'Platform Commission', value: currency + analytics.platformCommission.toLocaleString(), icon: TrendingUp, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { title: 'Approved / Pending', value: `${analytics.activeVendors} / ${analytics.pendingVendors}`, icon: Store, color: 'text-purple-600 bg-purple-50 border-purple-100' },
    { title: 'Total Orders', value: analytics.totalOrders.toLocaleString(), icon: ListOrdered, color: 'text-sky-600 bg-sky-50 border-sky-100' },
    { title: 'Total Products', value: analytics.totalProducts.toLocaleString(), icon: Package, color: 'text-rose-600 bg-rose-50 border-rose-100' },
  ];

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
          Global Administration Console
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">
          Moderate merchant registrations, approve products, and audit transaction volumes
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, i) => {
          const CardIcon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="bg-white border border-slate-200/60 rounded-3xl p-5 sm:p-6 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow duration-300"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {stat.title}
                </span>
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {stat.value}
                </span>
              </div>
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-sm ${stat.color}`}>
                <CardIcon className="w-5 h-5" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Platform Users Count */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.35 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-5 sm:p-6 shadow-lg flex items-center justify-between"
      >
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">
            Total Registered Users
          </span>
          <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {analytics.totalUsers.toLocaleString()}
          </span>
        </div>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/15 backdrop-blur-sm border border-white/20">
          <Users className="w-6 h-6 text-white" />
        </div>
      </motion.div>

      {/* Charts + Top Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.35 }}
          className="lg:col-span-3"
        >
          <OrdersAreaChart allOrders={recentOrders} />
        </motion.div>

        {/* Top Vendors Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.35 }}
          className="lg:col-span-2 bg-white border border-slate-200/60 rounded-3xl p-5 sm:p-6 shadow-sm"
        >
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5 mb-5">
            <Crown className="w-4 h-4 text-amber-500" />
            <span>Top Vendors</span>
          </h2>
          {topVendors.length === 0 ? (
            <p className="text-xs text-slate-400 font-semibold">No vendor revenue data yet.</p>
          ) : (
            <div className="space-y-3">
              {topVendors.map((vendor, idx) => (
                <div key={vendor.storeName} className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${
                      idx === 0 ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      idx === 1 ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                      'bg-orange-50 text-orange-600 border border-orange-100'
                    }`}>
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 truncate max-w-[140px]">{vendor.storeName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{vendor.orderCount} orders</p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-600">{currency}{vendor.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Recent Orders Table */}
      {recentOrdersList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.35 }}
          className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm"
        >
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4 text-indigo-500" />
              <span>Recent Orders</span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Order #</th>
                  <th className="px-5 py-3">Buyer</th>
                  <th className="px-5 py-3 text-center">Amount</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrdersList.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="px-5 py-3.5 font-extrabold text-indigo-600 font-mono tracking-wider">
                      {order.orderNumber}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">{order.buyerName}</td>
                    <td className="px-5 py-3.5 text-center font-extrabold text-slate-800">
                      {currency}{order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border ${statusColor[order.status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-slate-400 font-semibold">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
}
