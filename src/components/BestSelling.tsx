'use client';

import React, { useEffect, useState } from 'react';
import Title from './Title';
import ProductCard from './ProductCard';
import { searchProducts, type CatalogProduct } from '@/app/actions/products';

export default function BestSelling() {
  const displayQuantity = 8;
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchProducts({ sort: 'best', limit: displayQuantity, page: 1 })
      .then((result) => {
        if (result.success) {
          setProducts(result.products);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 my-16 sm:my-24 max-w-7xl mx-auto">
        <Title
          title="Best Selling"
          description="Loading best sellers…"
          href="/shop"
        />
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
          {Array.from({ length: displayQuantity }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-slate-200/60 rounded-2xl aspect-square"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 my-16 sm:my-24 max-w-7xl mx-auto">
      <Title
        title="Best Selling"
        description={`Displaying ${products.length} of our best-rated catalog items`}
        href="/shop"
      />
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
        {products.map((product, index: number) => (
          <ProductCard key={product.id || index} product={product} />
        ))}
      </div>
    </div>
  );
}
