'use client';

import React, { Suspense, useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw, Sparkles, ChevronRight, X } from 'lucide-react';
import Banner from '@/components/Banner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { expandSearchQuery } from '@/app/actions/ai';

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search parameters from URL
  const search = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';
  const sortParam = searchParams.get('sort') || 'default';

  // Redux state
  const products = useSelector((state: any) => state.product?.list || []);

  // Local state for AI synonyms
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [isExpanding, startTransition] = useTransition();
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [selectedSort, setSelectedSort] = useState(sortParam);
  const [searchVal, setSearchVal] = useState(search);

  // Sync category and sort when searchParams change
  useEffect(() => {
    setActiveCategory(categoryParam);
    setSelectedSort(sortParam);
    setSearchVal(search);
  }, [categoryParam, sortParam, search]);

  // Fetch synonyms from Gemini when the search query changes
  useEffect(() => {
    if (search.trim()) {
      startTransition(async () => {
        try {
          const res = await expandSearchQuery(search);
          if (res?.success && res.synonyms) {
            // filter out the exact search term from synonyms to avoid redundancy
            const filteredSyns = res.synonyms.filter(
              (s: string) => s.toLowerCase() !== search.toLowerCase()
            );
            setSynonyms(filteredSyns);
          } else {
            setSynonyms([]);
          }
        } catch (e) {
          console.error('Failed to expand search query:', e);
          setSynonyms([]);
        }
      });
    } else {
      setSynonyms([]);
    }
  }, [search]);

  // Handle category toggle
  const selectCategory = (cat: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (activeCategory === cat) {
      nextParams.delete('category');
      setActiveCategory('');
    } else {
      nextParams.set('category', cat);
      setActiveCategory(cat);
    }
    router.push(`/shop?${nextParams.toString()}`);
  };

  // Handle sorting selection
  const selectSort = (sortOption: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('sort', sortOption);
    setSelectedSort(sortOption);
    router.push(`/shop?${nextParams.toString()}`);
  };

  // Submit local search input
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const nextParams = new URLSearchParams(searchParams.toString());
    if (searchVal.trim()) {
      nextParams.set('search', searchVal);
    } else {
      nextParams.delete('search');
    }
    router.push(`/shop?${nextParams.toString()}`);
  };

  // Trigger search from clicking synonym chip
  const triggerSynonymSearch = (syn: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('search', syn);
    setSearchVal(syn);
    router.push(`/shop?${nextParams.toString()}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchVal('');
    setActiveCategory('');
    setSelectedSort('default');
    router.push('/shop');
  };

  // Core product filtering logic
  const filteredProducts = products.filter((prod: any) => {
    // 1. Text Search matching name, description, category, or synonyms
    if (search.trim()) {
      const sLower = search.toLowerCase();
      const nameMatch = prod.name.toLowerCase().includes(sLower);
      const descMatch = prod.description.toLowerCase().includes(sLower);
      const catMatch = prod.category.toLowerCase().includes(sLower);

      // Check if any of the active synonyms match the product name or description
      const synonymMatch = synonyms.some(
        (syn) =>
          prod.name.toLowerCase().includes(syn.toLowerCase()) ||
          prod.category.toLowerCase().includes(syn.toLowerCase())
      );

      if (!nameMatch && !descMatch && !catMatch && !synonymMatch) {
        return false;
      }
    }

    // 2. Category matching
    if (activeCategory) {
      if (prod.category.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  // Sort logic
  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    if (selectedSort === 'low-to-high') {
      return a.price - b.price;
    }
    if (selectedSort === 'high-to-low') {
      return b.price - a.price;
    }
    if (selectedSort === 'best') {
      const ratingA = a.rating?.reduce((acc: number, curr: any) => acc + curr.rating, 0) / (a.rating?.length || 1);
      const ratingB = b.rating?.reduce((acc: number, curr: any) => acc + curr.rating, 0) / (b.rating?.length || 1);
      return ratingB - ratingA;
    }
    if (selectedSort === 'discount') {
      const discA = a.mrp - a.price;
      const discB = b.mrp - b.price;
      return discB - discA;
    }
    return 0; // Default sorting (catalog ordering)
  });

  const categoriesList = ['Headphones', 'Speakers', 'Watch', 'Earbuds', 'Mouse', 'Decoration', 'Camera', 'Laptop', 'Keyboard', 'Tablet', 'Gaming'];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Banner />
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Filter Sidebar */}
          <aside className="w-full lg:w-64 flex flex-col space-y-6">
            {/* Title / Clear block */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                <span>Filter Catalog</span>
              </h2>
              {(search || activeCategory || selectedSort !== 'default') && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-rose-500 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear All
                </button>
              )}
            </div>

            {/* Local text search inside sidebar */}
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

            {/* Category selection */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Categories</h3>
              <div className="flex flex-wrap lg:flex-col gap-2">
                {categoriesList.map((cat) => {
                  const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
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

            {/* Sorting controls */}
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
                  const isSelected = selectedSort === option.value;
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

          {/* Right Product Grid Area */}
          <section className="flex-1 flex flex-col space-y-6">
            {/* Header info bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Explore Our Catalog</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1 font-semibold">
                  Found {sortedProducts.length} high-fidelity products in inventory
                </p>
              </div>

              {search && (
                <div className="flex items-center space-x-1.5 text-xs text-indigo-700 font-bold bg-indigo-50 border border-indigo-100 rounded-full px-3.5 py-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Activated Search for "{search}"</span>
                </div>
              )}
            </div>

            {/* AI Expanded Search Synonym Chips */}
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

            {/* Products grid */}
            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16">
                {sortedProducts.map((product: any) => (
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
                  ⚠️
                </div>
                <h3 className="text-base font-extrabold text-slate-800">No matching products found</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  We couldn't find any products in our database matching "{search || activeCategory}". Try clearing your filters or testing synonyms like 'kesar', 'audio', 'phone', or 'pashmina'.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-full shadow-md shadow-indigo-600/10 cursor-pointer"
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
