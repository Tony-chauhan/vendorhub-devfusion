'use client';

import React, { useEffect, useState } from 'react';
import { ShoppingBag, DollarSign, ListOrdered, Store } from 'lucide-react';
import { dummyAdminDashboardData } from '@/assets/assets';
import OrdersAreaChart from '@/components/OrdersAreaChart';

export default function AdminDashboard() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

  const [dashboardData, setDashboardData] = useState<any>({
    products: 0,
    revenue: 0,
    orders: 0,
    stores: 0,
    allOrders: [],
  });

  useEffect(() => {
    setDashboardData(dummyAdminDashboardData);
  }, []);

  const stats = [
    { title: 'Registered Products', value: dashboardData.products, icon: ShoppingBag, color: 'text-indigo-650 bg-indigo-50 border-indigo-100' },
    { title: 'Global Revenue', value: currency + Number(dashboardData.revenue).toLocaleString(), icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { title: 'Global Orders', value: dashboardData.orders, icon: ListOrdered, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { title: 'Registered Storefronts', value: dashboardData.stores, icon: Store, color: 'text-purple-600 bg-purple-50 border-purple-100' },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
          Global Administration Console
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">
          Moderate merchant registrations, approve products, and audit transaction volumes
        </p>
      </div>

      {/* Grid of stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const CardIcon = stat.icon;
          return (
            <div
              key={stat.title}
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
            </div>
          );
        })}
      </div>

      {/* Area chart */}
      <div className="max-w-4xl">
        <OrdersAreaChart allOrders={dashboardData.allOrders} />
      </div>
    </div>
  );
}
