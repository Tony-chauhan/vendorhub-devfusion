'use client';

import React, { useState } from 'react';
import { Search, ShoppingCart, User, Store, LogOut, Compass, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { useCustomUser, CustomSignInButton, CustomSignOutButton } from '@/lib/clerk-client';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [showDropdown, setShowDropdown] = useState(false);

  const cartCount = useSelector((state: any) => state.cart?.total || 0);
  const { isSignedIn, user } = useCustomUser();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/shop?search=${encodeURIComponent(search)}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/75 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo / Branding */}
          <div className="flex items-center">
            <Link href="/" className="relative flex items-center group">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Vendor<span className="text-indigo-600">Hub</span>
                <span className="text-indigo-600 font-black">.</span>
              </span>
              <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200/50 rounded">
                plus
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Link Menu */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors">
              Home
            </Link>
            <Link href="/shop" className="hover:text-indigo-600 transition-colors">
              Shop
            </Link>
            <Link href="/orders" className="hover:text-indigo-600 transition-colors">
              My Orders
            </Link>
            <Link href="/pricing" className="hover:text-indigo-600 transition-colors">
              Seller Pricing
            </Link>
          </div>

          {/* Action Row */}
          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden sm:flex items-center relative w-48 lg:w-64">
              <Search className="absolute left-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search premium items..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 hover:bg-slate-150 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-full border border-transparent outline-none transition-all placeholder:text-slate-400 text-slate-800"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            {/* Shopping Cart Icon with animated badge */}
            <Link href="/cart" className="relative p-2.5 hover:bg-slate-100 rounded-full transition-colors group">
              <ShoppingCart className="w-5 h-5 text-slate-700 group-hover:text-indigo-600 transition-colors" />
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute top-1 right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[9px] font-black text-white bg-indigo-600 rounded-full shadow-sm"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>

            {/* Clerk User Panel / Account Options */}
            {isSignedIn ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-2 p-1 bg-white hover:bg-slate-50 border border-slate-200 rounded-full shadow-sm cursor-pointer transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    {user?.firstName ? user.firstName.charAt(0) : 'U'}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-700 pr-2">
                    {user?.firstName || 'User'}
                  </span>
                </button>

                <AnimatePresence>
                  {showDropdown && (
                    <>
                      {/* Invisible backdrop to dismiss dropdown */}
                      <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-52 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-2xl shadow-xl py-2 z-20"
                      >
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="text-xs font-semibold text-slate-800">{user?.fullName}</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {user?.primaryEmailAddress?.emailAddress}
                          </p>
                        </div>

                        <Link
                          href="/store"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Store className="w-4 h-4 text-slate-500" />
                          <span>Seller Dashboard</span>
                        </Link>

                        <Link
                          href="/admin"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-slate-500" />
                          <span>Admin Console</span>
                        </Link>

                        <Link
                          href="/orders"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <Compass className="w-4 h-4 text-slate-500" />
                          <span>Manage Orders</span>
                        </Link>

                        <div className="border-t border-slate-100 my-1" />

                        <CustomSignOutButton>
                          <div className="flex items-center space-x-3 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50/50 transition-colors cursor-pointer w-full">
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </div>
                        </CustomSignOutButton>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <CustomSignInButton>
                <button className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-full shadow-sm shadow-indigo-600/10 transition-all cursor-pointer">
                  Sign In
                </button>
              </CustomSignInButton>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
