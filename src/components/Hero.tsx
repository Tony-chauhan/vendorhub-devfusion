'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { assets } from '@/assets/assets';
import { ArrowRight, ChevronRight, Compass, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 my-8 sm:my-12">
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left Primary Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative flex-1 overflow-hidden bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 border border-slate-200/60 rounded-3xl shadow-md group"
        >
          {/* Decorative radial gradients */}
          <div className="absolute -right-16 -top-16 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col xl:flex-row items-stretch min-h-[420px]">
            {/* Text Content */}
            <div className="relative z-10 flex flex-col justify-center space-y-4 p-6 sm:p-12 xl:w-1/2">
              <div className="inline-flex items-center gap-2 bg-indigo-50/80 border border-indigo-100 px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold text-indigo-700 w-fit">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Free Delivery on all orders above {currency}50!</span>
                <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Gadgets you'll <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">love</span>.<br />
                Prices you'll <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">trust</span>.
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 max-w-sm leading-relaxed">
                Explore our curation of premium, high-fidelity sound devices, smartphones, smartwatches, and next-gen laptop accessories.
              </p>

              <div className="pt-2 sm:pt-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Starting from
                </p>
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {currency}4.90
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-full shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Explore Shop Now</span>
                </Link>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative xl:w-1/2 min-h-[300px] xl:min-h-full overflow-hidden rounded-b-3xl xl:rounded-b-none xl:rounded-r-3xl group-hover:scale-[1.02] transition-transform duration-500">
              <Image
                src={assets.hero_model_img}
                alt="Premium Gadgets Showcase"
                fill
                className="object-cover object-top"
                priority
              />
            </div>
          </div>
        </motion.div>

        {/* Right Secondary Highlights Grid */}
        <div className="flex flex-col sm:flex-row xl:flex-col gap-6 w-full xl:max-w-sm">
          {/* Best Products Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex-1 flex items-center justify-between bg-gradient-to-br from-amber-50/70 to-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex flex-col justify-between h-full space-y-4">
              <div className="space-y-1">
                <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-100 rounded">
                  Highly Rated
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">
                  Best Sellers
                </h3>
              </div>
              <Link
                href="/shop?sort=best"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-700 group-hover:underline"
              >
                <span>View best items</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="relative w-28 h-28 pointer-events-none">
              <Image
                src={assets.hero_product_img1}
                alt="Best Products"
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </motion.div>

          {/* Discounts Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex-1 flex items-center justify-between bg-gradient-to-br from-pink-50/70 to-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex flex-col justify-between h-full space-y-4">
              <div className="space-y-1">
                <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-pink-700 bg-pink-50 border border-pink-100 rounded">
                  Limited Deals
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">
                  Hot Discounts
                </h3>
              </div>
              <Link
                href="/shop?sort=discount"
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-pink-700 group-hover:underline"
              >
                <span>Save up to 20%</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="relative w-28 h-28 pointer-events-none">
              <Image
                src={assets.hero_product_img2}
                alt="Limited discounts"
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
