'use client';

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Banner() {
  const [isOpen, setIsOpen] = useState(true);

  const handleClaim = () => {
    setIsOpen(false);
    toast.success('Coupon "NEW20" copied to clipboard!');
    navigator.clipboard.writeText('NEW20');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 overflow-hidden shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-white">
              <Gift className="w-4 h-4 animate-bounce" />
              <p className="text-xs sm:text-sm font-semibold tracking-wide">
                Special Launch Promo: Get <span className="underline decoration-wavy decoration-yellow-300">20% OFF</span> on your first order!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleClaim}
                className="hidden sm:inline-block px-4 py-1 bg-white text-indigo-600 hover:bg-slate-50 text-[11px] font-extrabold rounded-full shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                Claim Offer
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors text-white cursor-pointer"
                aria-label="Close promotion banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
