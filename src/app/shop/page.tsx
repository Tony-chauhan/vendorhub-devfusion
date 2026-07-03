'use client';

import React, { Suspense, useEffect, useState, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, RefreshCw, Sparkles, ChevronRight, X, Star } from 'lucide-react';
import Banner from '@/components/Banner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { expandSearchQuery } from '@/app/actions/ai';
import { searchProducts, type CatalogProduct } from '@/app/actions/products';
import { categories } from '@/assets/assets';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const sortParam = searchParams.get('sort') || 'default';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';
  const minRatingParam = searchParams.get('minRating') || '';

  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [isExpanding, startTransition] = useTransition();
  const [searchVal, setSearchVal] = useState(search);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam ? Number(maxPriceParam) : 500);
  const [minRating, setMinRating] = useState(minRatingParam ? Number(minRatingParam) : 0);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    searchProducts({
      search: search || undefined,
      category: categoryParam || undefined,
      minPrice: minPriceParam ? Number(minPriceParam) : undefined,
      maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
      minRating: minRatingParam ? Number(minRatingParam) : undefined,
      sort: sortParam as 'default' | 'low-to-high' | 'high-to-low' | 'best' | 'discount',
    }).then((result) => {
      if (result.success) {
        setProducts(result.products);
      }
      setLoading(false);
    });
  }, [search, categoryParam, sortParam, minPriceParam, maxPriceParam, minRatingParam]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    setSearchVal(search);
    setMaxPrice(maxPriceParam ? Number(maxPriceParam) : 500);
    setMinRating(minRatingParam ? Number(minRatingParam) : 0);
  }, [search, maxPriceParam, minRatingParam]);

  useEffect(() => {
    if (search.trim()) {
      startTransition(async () => {
        try {
          const res = await expandSearchQuery(search);
          if (res?.success && res.synonyms) {
            const filteredSyns = res.synonyms.filter(
              (s: string) => s.toLowerCase() !== search.toLowerCase()
            );
            setSynonyms(filteredSyns);
          } else {
            setSynonyms([]);
          }
        } catch {
          setSynonyms([]);
        }
      });
    } else {
      setSynonyms([]);
    }
  }, [search]);

  const pushParams = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') nextParams.delete(key);
      else nextParams.set(key, value);
    });
    router.push(`/shop?${nextParams.toString()}`);
  };

  const selectCategory = (cat: string) => {
    if (categoryParam.toLowerCase() === cat.toLowerCase()) {
      pushParams({ category: null });
    } else {
      pushParams({ category: cat });
    }
  };

  const selectSort = (sortOption: string) => {
    pushParams({ sort: sortOption === 'default' ? null : sortOption });
  };

  const applyPriceFilter = () => {
    pushParams({
      maxPrice: maxPrice < 500 ? String(maxPrice) : null,
      minPrice: null,
    });
  };

  const applyRatingFilter = (rating: number) => {
    pushParams({ minRating: rating > 0 ? String(rating) : null });
    setMinRating(rating);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    pushParams({ search: searchVal.trim() || null });
  };

  const triggerSynonymSearch = (syn: string) => {
    setSearchVal(syn);
    pushParams({ search: syn });
  };

  const clearFilters = () => {
    setSearchVal('');
    setMaxPrice(500);
    setMinRating(0);
    router.push('/shop');
  };

  const hasFilters =
    search || categoryParam || sortParam !== 'default' || minPriceParam || maxPriceParam || minRatingParam;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Banner />
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-64 flex flex-col space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <span>Filter Catalog</span>
              </h2>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-rose-500 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Search Keywords</h3>
              <form onSubmit={submitSearch} className="relative">
                <input
                  type="text"
                  placeholder="e.g. bluetooth speakers..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="w-full pl-3 pr-9 py-2.5 text-xs bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all font-medium"
                />
                <button
                  type="submit"
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-indigo-600 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Categories</h3>
              <div className="flex flex-wrap lg:flex-col gap-2">
                {categories.map((cat) => {
                  const isActive = categoryParam.toLowerCase() === cat.toLowerCase();
                  return (
                    <button
                      key={cat}
                      onClick={() => selectCategory(cat)}
                      className={`text-left px-4 py-2 text-xs rounded-xl font-bold transition-all cursor-pointer border ${
                        isActive
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Max Price</span>
                <span className="text-indigo-600">${maxPrice}</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                onMouseUp={applyPriceFilter}
                onTouchEnd={applyPriceFilter}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Minimum Rating</h3>
              <div className="grid grid-cols-3 gap-2">
                {[0, 3, 4, 4.5, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => applyRatingFilter(rating)}
                    className={`text-[10px] py-2 rounded-lg border font-bold cursor-pointer flex items-center justify-center gap-0.5 ${
                      minRating === rating
                        ? 'bg-amber-50 border-amber-300 text-amber-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {rating === 0 ? 'Any' : <><Star className="w-3 h-3" />{rating}</>}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Sort By</h3>
              <div className="grid grid-cols-2 lg:flex lg:flex-col gap-2">
                {[
                  { value: 'default', label: 'Recommended' },
                  { value: 'low-to-high', label: 'Price: Low to High' },
                  { value: 'high-to-low', label: 'Price: High to Low' },
                  { value: 'best', label: 'Top Customer Rated' },
                  { value: 'discount', label: 'Biggest Discount' },
                ].map((option) => {
                  const isSelected = sortParam === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => selectSort(option.value)}
                      className={`text-left px-4 py-2 text-xs rounded-xl font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200/50'
                          : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <section className="flex-1 flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">Explore Our Catalog</h1>
                <p className="text-xs text-slate-400 mt-1 font-semibold">
                  {loading ? 'Searching inventory...' : `Found ${products.length} products`}
                </p>
              </div>
              {search && (
                <div className="flex items-center space-x-1.5 text-xs text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 rounded-full px-3.5 py-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Server search: &quot;{search}&quot;</span>
                </div>
              )}
            </div>

            <AnimatePresence>
              {search && (synonyms.length > 0 || isExpanding) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gradient-to-r from-indigo-50/50 via-white to-purple-50/30 border border-slate-200/60 rounded-2xl p-4 flex flex-col space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Gemini AI Search Synonym Expander:</span>
                    {isExpanding && <RefreshCw className="w-3 h-3 text-indigo-500 animate-spin" />}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {synonyms.map((syn) => (
                      <button
                        key={syn}
                        onClick={() => triggerSynonymSearch(syn)}
                        className="px-3.5 py-1.5 text-[11px] font-extrabold text-indigo-700 hover:text-white bg-indigo-50 hover:bg-indigo-600 rounded-full cursor-pointer transition-all duration-300 flex items-center space-x-1"
                      >
                        <span>#{syn}</span>
                        <ChevronRight className="w-3 h-3 opacity-60" />
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
                <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
                  Running server-side product search...
                </p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto my-12 shadow-sm">
                <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 font-bold border border-rose-100">
                  !
                </div>
                <h3 className="text-base font-extrabold text-slate-800">No matching products found</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Try adjusting category, price, or rating filters.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-full shadow-md cursor-pointer"
                >
                  Reset Catalog Browse
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function Shop() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 justify-center items-center">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Loading Premium Catalog...</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
