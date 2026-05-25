'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MessageSquare, ShieldAlert, ArrowRight, Store } from 'lucide-react';
import RatingModal from './RatingModal';

interface ProductDescriptionProps {
  product: {
    id: string;
    name: string;
    description: string;
    mrp: number;
    price: number;
    images: any[];
    category: string;
    rating?: any[];
    store: {
      id: string;
      name: string;
      description: string;
      username: string;
      address: string;
      logo: any;
    };
  };
}

export default function ProductDescription({ product }: ProductDescriptionProps) {
  const [selectedTab, setSelectedTab] = useState<'Description' | 'Reviews'>('Description');
  const [showRatingModal, setShowRatingModal] = useState(false);

  const reviews = product.rating || [];

  return (
    <div className="my-12 sm:my-16 text-xs sm:text-sm text-slate-500">
      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 mb-6 max-w-md">
        {(['Description', 'Reviews'] as const).map((tab) => {
          const isActive = selectedTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-6 py-2.5 font-bold text-xs sm:text-sm transition-all border-b-2 cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-700 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab === 'Reviews' ? `Customer Reviews (${reviews.length})` : tab}
            </button>
          );
        })}
      </div>

      {/* Tab Contents: Description */}
      {selectedTab === 'Description' && (
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 max-w-3xl shadow-sm leading-relaxed text-slate-650 space-y-4">
          <p className="font-medium">{product.description}</p>
          <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Product Code: {product.id}</span>
            <span>Category: {product.category}</span>
          </div>
        </div>
      )}

      {/* Tab Contents: Reviews */}
      {selectedTab === 'Reviews' && (
        <div className="space-y-6 max-w-3xl">
          {/* Header Review Action block */}
          <div className="flex items-center justify-between bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm">
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Customer Feedback</h3>
              <p className="text-[11px] text-slate-400 font-semibold mt-0.5">
                Share your shopping experience with other buyers
              </p>
            </div>
            <button
              onClick={() => setShowRatingModal(true)}
              className="px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-750 text-white font-bold text-xs rounded-full shadow-md shadow-indigo-600/10 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
            >
              Write a Review
            </button>
          </div>

          {/* List reviews */}
          {reviews.length > 0 ? (
            <div className="flex flex-col space-y-4">
              {reviews.map((item: any, idx: number) => (
                <div
                  key={item.id || idx}
                  className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start gap-4 sm:gap-6 animate-in fade-in duration-300"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative shrink-0">
                    {item.user?.image ? (
                      <Image
                        src={item.user.image}
                        alt={item.user.name}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <span className="font-bold text-slate-500 text-xs">
                        {item.user?.name ? item.user.name.charAt(0) : 'U'}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2 flex-grow">
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-slate-800 text-xs sm:text-sm">
                        {item.user?.name || 'Anonymous Buyer'}
                      </p>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        {new Date(item.createdAt).toDateString()}
                      </span>
                    </div>

                    <div className="flex items-center space-x-0.5">
                      {Array(5)
                        .fill('')
                        .map((_, starIdx) => (
                          <Star
                            key={starIdx}
                            className="w-3.5 h-3.5"
                            fill={item.rating >= starIdx + 1 ? '#F59E0B' : '#E2E8F0'}
                            color={item.rating >= starIdx + 1 ? '#F59E0B' : '#E2E8F0'}
                          />
                        ))}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl font-medium pt-1">
                      {item.review}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center justify-center space-y-3 shadow-sm">
              <MessageSquare className="w-10 h-10 text-slate-300" />
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">No reviews yet</h4>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Be the first to share your thoughts about this item with other shoppers.
              </p>
              <button
                onClick={() => setShowRatingModal(true)}
                className="text-xs text-indigo-650 hover:underline font-bold cursor-pointer"
              >
                Rate this product now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Vendor Store Info Card */}
      <div className="mt-12 bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 sm:p-8 flex items-center justify-between max-w-3xl shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white rounded-full ring-2 ring-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
            {product.store?.logo ? (
              <Image
                src={product.store.logo}
                alt={product.store.name}
                width={48}
                height={48}
                className="object-cover"
              />
            ) : (
              <Store className="w-6 h-6 text-indigo-500" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider">
              Local Hyperlocal Partner
            </p>
            <h4 className="text-sm font-extrabold text-slate-800">
              Verified Stockist: {product.store?.name}
            </h4>
            <p className="text-[11px] text-slate-400 font-semibold max-w-sm truncate">
              {product.store?.address}
            </p>
          </div>
        </div>
        <Link
          href={`/shop?store=${product.store?.id}`}
          className="inline-flex items-center space-x-1.5 px-4.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-full shadow-sm active:scale-95 transition-all"
        >
          <span>Visit Store</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-450" />
        </Link>
      </div>

      {/* Rating modal instance */}
      {showRatingModal && (
        <RatingModal productId={product.id} onClose={() => setShowRatingModal(false)} />
      )}
    </div>
  );
}
