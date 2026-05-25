'use client';

import React from 'react';
import Title from './Title';
import ProductCard from './ProductCard';
import { useSelector } from 'react-redux';

export default function BestSelling() {
  const displayQuantity = 8;
  const products = useSelector((state: any) => state.product?.list || []);

  const bestSellers = [...products]
    .sort((a, b) => (b.rating?.length || 0) - (a.rating?.length || 0))
    .slice(0, displayQuantity);

  return (
    <div className="px-4 sm:px-6 lg:px-8 my-16 sm:my-24 max-w-7xl mx-auto">
      <Title
        title="Best Selling"
        description={`Displaying ${Math.min(products.length, displayQuantity)} of our ${products.length} catalog items`}
        href="/shop"
      />
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
        {bestSellers.map((product: any, index: number) => (
          <ProductCard key={product.id || index} product={product} />
        ))}
      </div>
    </div>
  );
}
