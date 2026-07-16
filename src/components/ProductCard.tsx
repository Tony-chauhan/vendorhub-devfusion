'use client';

import React from 'react';
import { Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    mrp: number;
    price: number;
    images: string[];
    category: string;
    rating?: { rating: number }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';

  // calculate the average rating safely
  const rating =
    product.rating && product.rating.length > 0
      ? Math.round(product.rating.reduce((acc, curr) => acc + curr.rating, 0) / product.rating.length)
      : 5;

  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col w-full max-w-[280px] sm:max-w-xs mx-auto">
      {/* Product Image Panel */}
      <div className="relative aspect-square w-full bg-slate-100/70 border border-slate-200/50 rounded-2xl flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
        <Image
          width={400}
          height={400}
          className="max-h-[70%] w-auto object-contain transform group-hover:scale-108 transition-all duration-500"
          src={product.images[0]}
          alt={product.name}
          priority
        />
        {/* Hover overlay or subtle badge */}
        <span className="absolute top-3 left-3 px-2 py-0.5 text-[9px] font-bold tracking-wider text-slate-500 bg-white/90 backdrop-blur-sm border border-slate-200/40 rounded-full">
          {product.category}
        </span>
      </div>

      {/* Details Row */}
      <div className="flex justify-between gap-3 text-xs sm:text-sm pt-3.5 px-1">
        <div className="flex flex-col space-y-1 max-w-[70%]">
          <p className="font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
            {product.name}
          </p>
          <div className="flex items-center space-x-0.5">
            {Array(5)
              .fill('')
              .map((_, idx) => (
                <Star
                  key={idx}
                  className="w-3.5 h-3.5"
                  fill={rating >= idx + 1 ? '#F59E0B' : '#E2E8F0'}
                  color={rating >= idx + 1 ? '#F59E0B' : '#E2E8F0'}
                />
              ))}
            <span className="text-[10px] text-slate-400 font-medium ml-1">
              ({product.rating?.length || 0})
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="font-black text-slate-900">
            {currency}
            {product.price}
          </p>
          {product.mrp > product.price && (
            <p className="text-[10px] text-slate-400 line-through">
              {currency}
              {product.mrp}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
