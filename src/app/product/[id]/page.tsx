'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Banner from '@/components/Banner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductDetails from '@/components/ProductDetails';
import ProductDescription from '@/components/ProductDescription';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const [product, setProduct] = useState<any>(null);
  const products = useSelector((state: any) => state.product?.list || []);

  useEffect(() => {
    if (products.length > 0) {
      const matched = products.find((p: any) => p.id === id);
      setProduct(matched || null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id, products]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Banner />
      <Suspense fallback={<div className="h-20 bg-white border-b border-slate-200" />}>
        <Navbar />
      </Suspense>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Link Row */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
            <span>Go Back</span>
          </button>
        </div>

        {product ? (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Breadcrumb path */}
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Catalog / Products / {product.category} / {product.name}
            </div>

            {/* Product core specs & image panel */}
            <ProductDetails product={product} />

            {/* In-depth descriptions, reviews logs, store stats */}
            <ProductDescription product={product} />
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center py-24 space-y-4">
            <RefreshCw className="w-8 h-8 text-indigo-650 animate-spin" />
            <p className="text-xs font-extrabold text-slate-400 tracking-widest uppercase">
              Locating Product Details...
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
