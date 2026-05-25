'use client';

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart } from '@/lib/features/cart/cartSlice';
import { Plus, Minus } from 'lucide-react';

interface CounterProps {
  productId: string;
}

export default function Counter({ productId }: CounterProps) {
  const cartItems = useSelector((state: any) => state.cart?.cartItems || {});
  const dispatch = useDispatch();

  const quantity = cartItems[productId] || 0;

  const handleIncrement = () => {
    dispatch(addToCart({ productId }));
  };

  const handleDecrement = () => {
    dispatch(removeFromCart({ productId }));
  };

  return (
    <div className="inline-flex items-center space-x-3 bg-white border border-slate-200 shadow-sm rounded-full px-4 py-1.5 text-xs font-bold text-slate-700">
      <button
        onClick={handleDecrement}
        className="p-1 hover:bg-slate-50 rounded-full transition-colors active:scale-90 cursor-pointer text-slate-500"
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-6 text-center select-none text-slate-900 font-extrabold">{quantity}</span>
      <button
        onClick={handleIncrement}
        className="p-1 hover:bg-slate-50 rounded-full transition-colors active:scale-90 cursor-pointer text-slate-500"
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
