'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, DollarSign, ListOrdered, Star, MessageSquare, ExternalLink } from 'lucide-react';
import { dummyStoreDashboardData } from '@/assets/assets';

export default function StoreDashboard() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<any>({
    totalProducts: 0,
    totalEarnings: 0,
    totalOrders: 0,
    ratings: [],
  });

  useEffect(() => {
    setDashboardData(dummyStoreDashboardData);
  }, []);

  const stats = [
    { title: 'Total Products', value: dashboardData.totalProducts, icon: ShoppingBag, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { title: 'Total Earnings', value: currency + dashboardData.totalEarnings.toLocaleString(), icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { title: 'Customer Orders', value: dashboardData.totalOrders, icon: ListOrdered, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { title: 'Average Ratings', value: `${dashboardData.ratings.length} Reviews`, icon: Star, color: 'text-purple-600 bg-purple-50 border-purple-100' },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
          Merchant Workspace Overview
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">
          Real-time analytics and customer feedback stream for your storefront
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

      {/* Reviews feed */}
      <div className="space-y-4">
        <h2 className="text-sm font-extrabold text-slate-850 uppercase tracking-widest flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          <span>Verified Buyer Feedback</span>
        </h2>

        <div className="grid grid-cols-1 gap-4 max-w-4xl">
          {dashboardData.ratings.map((review: any, idx: number) => {
            const averageStars = review.rating || 5;

            return (
              <div
                key={`${review.id || 'review'}-${idx}`}
                className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative">
                    {review.user?.image ? (
                      <Image
                        src={review.user.image}
                        alt={review.user.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <span className="font-bold text-slate-500 text-xs">
                        {review.user?.name ? review.user.name.charAt(0) : 'U'}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <p className="font-extrabold text-slate-800 text-xs sm:text-sm">
                        {review.user?.name}
                      </p>
                      <span className="text-[9px] text-slate-350 font-bold uppercase">
                        {new Date(review.createdAt).toDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold max-w-lg">
                      "{review.review}"
                    </p>
                  </div>
                </div>

                {/* Product Column */}
                <div className="flex flex-col md:items-end space-y-2.5 w-full md:w-auto shrink-0 border-t border-slate-100 md:border-t-0 pt-4 md:pt-0">
                  <div className="md:text-right space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-indigo-500 tracking-wider">
                      {review.product?.category}
                    </span>
                    <p className="text-xs font-bold text-slate-800 truncate max-w-[180px]">
                      {review.product?.name}
                    </p>
                    <div className="flex md:justify-end items-center space-x-0.5 pt-0.5">
                      {Array(5)
                        .fill('')
                        .map((_, starIdx) => (
                          <Star
                            key={starIdx}
                            className="w-3.5 h-3.5"
                            fill={averageStars >= starIdx + 1 ? '#F59E0B' : '#E2E8F0'}
                            color={averageStars >= starIdx + 1 ? '#F59E0B' : '#E2E8F0'}
                          />
                        ))}
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/product/${review.product?.id || 'prod_1'}`)}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-extrabold rounded-full active:scale-95 transition-all cursor-pointer w-full md:w-auto justify-center"
                  >
                    <span>View Product</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
