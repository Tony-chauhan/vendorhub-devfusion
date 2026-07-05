import React, { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, PackageX } from 'lucide-react';
import Banner from '@/components/Banner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductDetails from '@/components/ProductDetails';
import ProductDescription from '@/components/ProductDescription';
import { getProductById } from '@/app/actions/products';

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const result = await getProductById(id);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Banner />
      <Suspense fallback={<div className="h-20 bg-white border-b border-slate-200" />}>
        <Navbar />
      </Suspense>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Link Row */}
        <div className="mb-6">
          <Link
            href="/shop"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
            <span>Go Back</span>
          </Link>
        </div>

        {result.success ? (
          <div className="space-y-12 animate-in fade-in duration-300">
            {/* Breadcrumb path */}
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              Catalog / Products / {result.product.category} / {result.product.name}
            </div>

            {/* Product core specs & image panel */}
            <ProductDetails product={result.product} />

            {/* In-depth descriptions, reviews logs, store stats */}
            <ProductDescription product={result.product} />
          </div>
        ) : (
          <div className="flex flex-col justify-center items-center py-24 space-y-4">
            <PackageX className="w-10 h-10 text-slate-300" />
            <p className="text-xs font-extrabold text-slate-400 tracking-widest uppercase">
              Product Not Found
            </p>
            <Link
              href="/shop"
              className="text-xs text-indigo-650 hover:underline font-bold cursor-pointer"
            >
              Browse the catalog instead
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
