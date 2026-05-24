"use client";

import React, { useState, useMemo } from "react";
import { 
  Search, 
  MapPin, 
  SlidersHorizontal, 
  ShoppingBag, 
  Heart, 
  Star, 
  ArrowRight, 
  Sparkles, 
  Check, 
  AlertTriangle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Interface definitions
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  rating: number;
  images: string[];
  category: string;
  vendorName: string;
  location: string;
}

// Rich Mock Products reflecting hyperlocal vendors in India
const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "iPhone 15 Pro Max",
    description: "Titanium design, 256GB storage, A17 Pro chip. Fast delivery from Bangalore tech hub.",
    price: 1399,
    stock: 7,
    rating: 4.9,
    images: ["https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80"],
    category: "Electronics",
    vendorName: "Alpha Retailers",
    location: "Bangalore"
  },
  {
    id: "p2",
    name: "Pure Kashmiri Saffron",
    description: "Premium A++ grade organic kesar threads handpicked in Srinagar. Perfect for sweets and tea.",
    price: 18,
    stock: 35,
    rating: 5.0,
    images: ["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=80"],
    category: "Groceries",
    vendorName: "Valley Organic Farm",
    location: "Srinagar"
  },
  {
    id: "p3",
    name: "Wireless ANC Headphones",
    description: "Over-ear active noise cancelling headphones with 40-hour battery life and deep bass.",
    price: 199,
    stock: 2, // Low stock warning trigger
    rating: 4.6,
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80"],
    category: "Electronics",
    vendorName: "Mumbai Digital Store",
    location: "Mumbai"
  },
  {
    id: "p4",
    name: "Ergonomic Office Chair",
    description: "High-back mesh chair with adjustable lumbar support, 3D armrests, and premium tilt mechanism.",
    price: 249,
    stock: 12,
    rating: 4.5,
    images: ["https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=500&auto=format&fit=crop&q=80"],
    category: "Furniture",
    vendorName: "Delhi Decor House",
    location: "Delhi"
  },
  {
    id: "p5",
    name: "Handwoven Pashmina Shawl",
    description: "100% pure authentic cashmere shawl designed by traditional craftsmen in Kashmir valleys.",
    price: 110,
    stock: 8,
    rating: 4.8,
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80"],
    category: "Clothing",
    vendorName: "Valley Organic Farm",
    location: "Srinagar"
  },
  {
    id: "p6",
    name: "Organic Forest Honey",
    description: "Wild honey extracted organically from Mahabaleshwar forests. Pure, unpasteurized, and delicious.",
    price: 12,
    stock: 4,
    rating: 4.3,
    images: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80"],
    category: "Groceries",
    vendorName: "Western Ghats Eco Shop",
    location: "Pune"
  },
  {
    id: "p7",
    name: "Mechanical Gaming Keyboard",
    description: "Tenkeyless mechanical keyboard with customizable RGB, hot-swappable red linear switches.",
    price: 79,
    stock: 1, // Critical low stock alert trigger!
    rating: 4.7,
    images: ["https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80"],
    category: "Electronics",
    vendorName: "Mumbai Digital Store",
    location: "Mumbai"
  },
  {
    id: "p8",
    name: "Minimalist Wooden Desk",
    description: "Solid oak wooden study table with metal legs and cable organizers. Perfect for remote setups.",
    price: 320,
    stock: 5,
    rating: 4.4,
    images: ["https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&auto=format&fit=crop&q=80"],
    category: "Furniture",
    vendorName: "Delhi Decor House",
    location: "Delhi"
  }
];

// Synonym mapping to demonstrate search intelligence (fuzzy matching preview)
const SYNONYMS: Record<string, string[]> = {
  phone: ["iphone", "mobile", "cell", "device"],
  kesar: ["saffron", "spices", "pure"],
  spices: ["saffron", "honey", "organic"],
  audio: ["headphones", "wireless", "speaker"],
  chair: ["office", "furniture", "study"],
  desk: ["table", "study", "wooden", "furniture"],
  kashmir: ["pashmina", "shawl", "saffron", "srinagar"],
  wear: ["clothing", "pashmina", "shawl"]
};

export default function ProductBrowse() {
  // Local state management
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedLocation, setSelectedLocation] = useState<string>("All");
  const [maxPrice, setMaxPrice] = useState<number>(1500);
  const [minRating, setMinRating] = useState<number>(0);
  
  // Shopping Cart & Wishlist preview states
  const [cartCount, setCartCount] = useState<number>(0);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const [addedProductIds, setAddedProductIds] = useState<string[]>([]);

  // Unique categories and locations extraction
  const categories = useMemo(() => {
    return ["All", ...Array.from(new Set(MOCK_PRODUCTS.map((p) => p.category)))];
  }, []);

  const locations = useMemo(() => {
    return ["All", ...Array.from(new Set(MOCK_PRODUCTS.map((p) => p.location)))];
  }, []);

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      // 1. Category Filter
      if (selectedCategory !== "All" && product.category !== selectedCategory) {
        return false;
      }

      // 2. Hyperlocal Location Filter
      if (selectedLocation !== "All" && product.location !== selectedLocation) {
        return false;
      }

      // 3. Price Filter
      if (product.price > maxPrice) {
        return false;
      }

      // 4. Rating Filter
      if (product.rating < minRating) {
        return false;
      }

      // 5. Intelligent Query Match (includes synonym dictionary checking)
      if (searchQuery.trim() !== "") {
        const queryLower = searchQuery.toLowerCase().trim();
        const productNameLower = product.name.toLowerCase();
        const productDescLower = product.description.toLowerCase();
        const productCatLower = product.category.toLowerCase();
        const productVendorLower = product.vendorName.toLowerCase();

        // Direct matching
        if (
          productNameLower.includes(queryLower) ||
          productDescLower.includes(queryLower) ||
          productCatLower.includes(queryLower) ||
          productVendorLower.includes(queryLower)
        ) {
          return true;
        }

        // Synonym checking
        for (const [key, synonyms] of Object.entries(SYNONYMS)) {
          if (queryLower.includes(key) || key.includes(queryLower)) {
            const matchesSynonym = synonyms.some(
              (syn) =>
                productNameLower.includes(syn) ||
                productDescLower.includes(syn) ||
                productCatLower.includes(syn)
            );
            if (matchesSynonym) return true;
          }
        }
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, selectedLocation, maxPrice, minRating]);

  // Wishlist toggle
  const toggleWishlist = (id: string) => {
    setWishlistedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Add to cart micro-animation simulation
  const handleAddToCart = (id: string) => {
    setCartCount((prev) => prev + 1);
    setAddedProductIds((prev) => [...prev, id]);
    setTimeout(() => {
      setAddedProductIds((prev) => prev.filter((item) => item !== id));
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* 🚀 Sleek Glassmorphic Navbar */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-900/60 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-purple-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-2xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-indigo-500 tracking-tight">
              VendorHub
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-slate-500 ml-2 bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">
              DevFusion 2.0
            </span>
          </div>
        </div>

        {/* Hyperlocal quick indicator */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-950/50 px-4 py-2 rounded-full border border-slate-800/80">
          <MapPin className="h-4 w-4 text-purple-400" />
          <span className="text-sm font-medium text-slate-300">
            Selected Hub: <strong className="text-indigo-400">{selectedLocation === "All" ? "Everywhere (India)" : selectedLocation}</strong>
          </span>
        </div>

        {/* Global Cart & Wishlist counters */}
        <div className="flex items-center gap-4">
          <button className="relative p-2.5 rounded-full hover:bg-slate-800/70 border border-transparent hover:border-slate-700/50 transition-all text-slate-400 hover:text-slate-100">
            <Heart className="h-5.5 w-5.5" />
            {wishlistedIds.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                {wishlistedIds.length}
              </span>
            )}
          </button>
          
          <button className="relative p-2.5 rounded-full hover:bg-slate-800/70 border border-transparent hover:border-slate-700/50 transition-all text-slate-400 hover:text-slate-100">
            <ShoppingBag className="h-5.5 w-5.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
                {cartCount}
              </span>
            )}
          </button>

          <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-sm px-5 py-2.5 rounded-full shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all">
            Join Sandbox
          </button>
        </div>
      </header>

      {/* 🔮 Rich Hero Banner */}
      <section className="relative w-full py-20 px-6 overflow-hidden flex flex-col items-center justify-center border-b border-slate-900">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl text-center flex flex-col items-center gap-6 z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase flex items-center gap-2"
          >
            <Sparkles className="h-3.5 w-3.5" /> Hyperlocal E-Commerce Redefined
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-black leading-tight tracking-tight text-white"
          >
            Smarter shopping from <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-indigo-300 to-indigo-500">
              local vendors
            </span> nearby.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-lg max-w-2xl leading-relaxed"
          >
            Experience a modern, high-performance marketplace powered by serverless technology, 
            instant background notifications, optimized assets, and AI-driven fuzzy search support.
          </motion.p>
        </div>
      </section>

      {/* 🔍 Interactive Filter & Search Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12 flex-1 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 🛠️ Glassmorphic Left Sidebar Filters */}
        <aside className="lg:col-span-1 bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-md flex flex-col gap-8 h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-purple-400" /> Filters
            </h2>
            <button 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedLocation("All");
                setMaxPrice(1500);
                setMinRating(0);
              }}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-semibold"
            >
              Reset All
            </button>
          </div>

          {/* 📍 Hyperlocal Location Hubs */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Hyperlocal Hub</label>
            <div className="flex flex-col gap-1.5">
              {locations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className={`w-full text-left text-sm px-4 py-2.5 rounded-xl border transition-all flex items-center justify-between ${
                    selectedLocation === loc
                      ? "bg-indigo-600/10 border-indigo-500/50 text-indigo-300 font-semibold"
                      : "bg-slate-950/20 border-slate-800/50 text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" /> {loc === "All" ? "All Locations" : loc}
                  </span>
                  {selectedLocation === loc && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* 📂 Category Filter */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-3.5 py-2 rounded-xl border transition-all font-medium ${
                    selectedCategory === cat
                      ? "bg-purple-600/10 border-purple-500/50 text-purple-300 font-bold"
                      : "bg-slate-950/20 border-slate-800/50 text-slate-400 hover:bg-slate-800/30 hover:text-slate-200"
                  }`}
                >
                  {cat === "All" ? "All Items" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* 💵 Price Range Filter */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
              <span>Max Price</span>
              <span className="text-indigo-400 font-extrabold text-sm">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="10"
              max="1500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-full cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold">
              <span>$10</span>
              <span>$1500</span>
            </div>
          </div>

          {/* ⭐ Rating Filter */}
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Minimum Rating</label>
            <div className="grid grid-cols-5 gap-1.5">
              {[0, 3, 4, 4.5, 4.8].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setMinRating(rating)}
                  className={`text-[10px] py-2 rounded-lg border text-center transition-all font-bold ${
                    minRating === rating
                      ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                      : "bg-slate-950/20 border-slate-800/50 text-slate-500 hover:bg-slate-800/30 hover:text-slate-300"
                  }`}
                >
                  {rating === 0 ? "Any" : `${rating}★`}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 📦 Right Side Grid */}
        <main className="lg:col-span-3 flex flex-col gap-8">
          
          {/* Search bar with instant AI helper notification */}
          <div className="flex flex-col gap-3">
            <div className="relative w-full">
              <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Search products, categories, or try synonyms like 'phone', 'kashmir', 'audio', 'kesar'..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800/80 hover:border-slate-700/50 focus:border-indigo-500/80 rounded-2xl py-4 pl-13 pr-6 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition-all shadow-inner focus:shadow-indigo-500/5"
              />
            </div>
            
            {/* Real-time synonym feedback banner */}
            {searchQuery.trim().length > 1 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/5 rounded-xl border border-indigo-500/10 text-xs text-indigo-300/90 font-medium">
                <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                <span>
                  Synonym Engine Active: matching search terms with local catalog equivalents.
                </span>
              </div>
            )}
          </div>

          {/* Results summary bar */}
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>
              Showing <strong className="text-slate-200">{filteredProducts.length}</strong> products
            </span>
            {selectedLocation !== "All" && (
              <span>
                Filtered by Location: <strong className="text-purple-400">{selectedLocation}</strong>
              </span>
            )}
          </div>

          {/* 🛍️ Dynamic Grid of Glassmorphic Product Cards */}
          {filteredProducts.length === 0 ? (
            <div className="w-full py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-4 text-center">
              <AlertTriangle className="h-10 w-10 text-purple-400/80" />
              <div>
                <h3 className="font-bold text-lg text-white">No products match your criteria</h3>
                <p className="text-slate-500 text-sm mt-1">Try resetting the filters or modifying your search query.</p>
              </div>
            </div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    className="relative group bg-slate-900/30 border border-slate-850 hover:border-slate-750/70 rounded-3xl overflow-hidden backdrop-blur-sm transition-all duration-300 hover:-translate-y-1.5 flex flex-col shadow-lg shadow-black/40 hover:shadow-indigo-500/5"
                  >
                    {/* Image panel with local hub tag */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                      
                      {/* Location Badge */}
                      <span className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md border border-slate-700/50 text-[10px] font-bold text-slate-300 px-3 py-1 rounded-full flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-purple-400" /> {product.location}
                      </span>

                      {/* Wishlist Button */}
                      <button
                        onClick={() => toggleWishlist(product.id)}
                        className={`absolute top-4 right-4 p-2 rounded-full border backdrop-blur-md transition-all ${
                          wishlistedIds.includes(product.id)
                            ? "bg-rose-500/20 border-rose-500/40 text-rose-400"
                            : "bg-slate-900/85 border-slate-700/50 text-slate-400 hover:text-rose-400"
                        }`}
                      >
                        <Heart 
                          className="h-4 w-4" 
                          fill={wishlistedIds.includes(product.id) ? "currentColor" : "none"} 
                        />
                      </button>

                      {/* Category Badge */}
                      <span className="absolute bottom-4 left-4 bg-purple-500/20 border border-purple-500/30 text-[9px] font-extrabold uppercase tracking-wider text-purple-300 px-2.5 py-0.5 rounded">
                        {product.category}
                      </span>
                    </div>

                    {/* Information panel */}
                    <div className="p-5 flex-1 flex flex-col gap-3 justify-between">
                      <div className="flex flex-col gap-2">
                        {/* Title & Rating */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-white text-base group-hover:text-purple-300 transition-colors leading-tight">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-1 text-amber-400 shrink-0 text-sm font-bold bg-amber-400/5 border border-amber-400/10 px-2 py-0.5 rounded-lg">
                            <Star className="h-3.5 w-3.5 fill-amber-400" /> {product.rating}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>

                        {/* Vendor Name */}
                        <div className="text-[11px] text-slate-500 font-medium">
                          Store: <strong className="text-slate-400 font-semibold">{product.vendorName}</strong>
                        </div>
                      </div>

                      {/* Footer: Price & Add button */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Price</span>
                          <span className="text-xl font-extrabold text-white">${product.price}</span>
                        </div>

                        {/* Direct purchase with stock checks */}
                        <div className="flex items-center gap-2">
                          {product.stock <= 3 && (
                            <div className="flex items-center gap-1 text-[10px] text-orange-400 font-extrabold bg-orange-400/5 border border-orange-400/10 px-2 py-1 rounded">
                              <AlertTriangle className="h-3.5 w-3.5" /> Low Stock ({product.stock})
                            </div>
                          )}

                          <button
                            onClick={() => handleAddToCart(product.id)}
                            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
                              addedProductIds.includes(product.id)
                                ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300"
                                : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/10"
                            }`}
                          >
                            {addedProductIds.includes(product.id) ? (
                              <>
                                <Check className="h-3.5 w-3.5" /> Added
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="h-3.5 w-3.5" /> Add
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </main>
      </section>

      {/* 🔮 Footer Section */}
      <footer className="mt-auto w-full bg-slate-950 border-t border-slate-900 px-6 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
          <span>© {new Date().getFullYear()} TeamXdesign. Built for DevFusion 2.0.</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
          <a href="#" className="hover:text-slate-100 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-100 transition-colors">Terms of Use</a>
          <a href="#" className="hover:text-slate-100 transition-colors">Contact Support</a>
        </div>
      </footer>
    </div>
  );
}
