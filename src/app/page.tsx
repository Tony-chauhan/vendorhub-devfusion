'use client';

import React, { Suspense } from 'react';
import Banner from '@/components/Banner';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import CategoriesMarquee from '@/components/CategoriesMarquee';
import LatestProducts from '@/components/LatestProducts';
import BestSelling from '@/components/BestSelling';
import OurSpec from '@/components/OurSpec';
import Newsletter from '@/components/Newsletter';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      <Banner />
      <Suspense fallback={<div className="h-20 bg-white border-b border-slate-200" />}>
        <Navbar />
      </Suspense>
      <main className="flex-1">
        <Hero />
        <CategoriesMarquee />
        <LatestProducts />
        <BestSelling />
        <OurSpec />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
