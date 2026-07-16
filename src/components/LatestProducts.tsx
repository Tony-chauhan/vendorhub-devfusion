'use client';

import React, { useEffect, useState } from 'react';
import Title from './Title';
import ProductCard from './ProductCard';
import { searchProducts, type CatalogProduct } from '@/app/actions/products';

export default function LatestProducts() {
  const displayQuantity = 4;
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchProducts({ sort: 'default', limit: displayQuantity, page: 1 })
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
          title="Latest Products"
          description="Loading our most recent catalog arrivals…"
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
        title="Latest Products"
        description={`Displaying ${products.length} of our most recent catalog arrivals`}
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
