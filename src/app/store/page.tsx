'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  ShoppingBag,
  DollarSign,
  ListOrdered,
  Star,
  MessageSquare,
  ExternalLink,
  Package,
  PlusCircle,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { getVendorAnalytics, type VendorReviewItem } from '@/app/actions/products';
import OrdersAreaChart from '@/components/OrdersAreaChart';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const },
  }),
};

export default function StoreDashboard() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<{
    totalProducts: number;
    totalEarnings: number;
    totalOrders: number;
    outOfStockCount: number;
    lowStockCount: number;
    ratings: VendorReviewItem[];
    recentOrders: Array<{ createdAt: string; total: number }>;
  }>({
    totalProducts: 0,
    totalEarnings: 0,
    totalOrders: 0,
    outOfStockCount: 0,
    lowStockCount: 0,
    ratings: [],
    recentOrders: [],
  });

  useEffect(() => {
    getVendorAnalytics().then((res) => {
      if (res.success) {
        setDashboardData({
          totalProducts: res.analytics.totalProducts,
          totalEarnings: res.analytics.totalEarnings,
          totalOrders: res.analytics.totalOrders,
          outOfStockCount: res.analytics.outOfStockCount,
          lowStockCount: res.analytics.lowStockCount,
          ratings: res.reviews,
          recentOrders: res.recentOrders,
        });
      }
      setLoading(false);
    });
  }, []);

  const inStockCount = Math.max(0, dashboardData.totalProducts - dashboardData.outOfStockCount);
  const inStockPercent = dashboardData.totalProducts > 0
    ? Math.round((inStockCount / dashboardData.totalProducts) * 100)
    : 100;

  const stats = [
    { title: 'Total Products', value: dashboardData.totalProducts, icon: ShoppingBag, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { title: 'Total Earnings', value: currency + dashboardData.totalEarnings.toLocaleString(), icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { title: 'Customer Orders', value: dashboardData.totalOrders, icon: ListOrdered, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { title: 'Average Ratings', value: `${dashboardData.ratings.length} Reviews`, icon: Star, color: 'text-purple-600 bg-purple-50 border-purple-100' },
  ];

  const quickActions = [
    { label: 'View Orders', href: '/store/orders', icon: ListOrdered, desc: 'Manage incoming orders' },
    { label: 'Manage Inventory', href: '/store/manage-product', icon: Package, desc: 'Edit products & stock' },
    { label: 'Add Product', href: '/store/add-product', icon: PlusCircle, desc: 'List a new product' },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
          Merchant Workspace Overview
        </h1>
        <p className="text-xs text-slate-400 font-semibold mt-0.5">
          Real-time analytics and customer feedback stream for your storefront
        </p>
        </div>
        {loading && <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />}
      </div>

      {/* Grid of stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

      {/* Inventory Health + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inventory Health */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
          className="bg-white border border-slate-200/60 rounded-3xl p-5 sm:p-6 shadow-sm"
        >
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest flex items-center gap-1.5 mb-5">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <span>Inventory Health</span>
          </h2>

          {/* Circular progress ring */}
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                <circle
                  cx="40" cy="40" r="34"
                  stroke={inStockPercent >= 70 ? '#10b981' : inStockPercent >= 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${(inStockPercent / 100) * 213.6} 213.6`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-800">
                {inStockPercent}%
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold text-slate-600">In Stock: {inStockCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="font-semibold text-slate-600">Low Stock: {dashboardData.lowStockCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="font-semibold text-slate-600">Out of Stock: {dashboardData.outOfStockCount}</span>
              </div>
            </div>
          </div>

          {dashboardData.lowStockCount > 0 && (
            <div className="mt-4 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-[10px] font-bold text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" />
              {dashboardData.lowStockCount} product{dashboardData.lowStockCount > 1 ? 's' : ''} running low on stock
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.35 }}
          className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {quickActions.map((action, i) => {
            const ActionIcon = action.icon;
            return (
              <Link
                key={action.label}
                href={action.href}
                className="bg-white border border-slate-200/60 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col items-start gap-3"
              >
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-indigo-50 border border-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-colors duration-300">
                  <ActionIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-800">{action.label}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{action.desc}</p>
                </div>
              </Link>
            );
          })}
        </motion.div>
      </div>

      {/* Revenue Chart */}
      {dashboardData.recentOrders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.35 }}
          className="max-w-4xl"
        >
          <OrdersAreaChart allOrders={dashboardData.recentOrders} />
        </motion.div>
      )}

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
              <motion.div
                key={`${review.id || 'review'}-${idx}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + idx * 0.05, duration: 0.3 }}
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
                      &quot;{review.review}&quot;
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
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
