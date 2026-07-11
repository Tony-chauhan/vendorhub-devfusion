'use client';

import React, { useEffect, useState, Suspense, useTransition } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Trash2, ShoppingBag, ArrowLeft, RefreshCw } from 'lucide-react';
import Banner from '@/components/Banner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Counter from '@/components/Counter';
import OrderSummary from '@/components/OrderSummary';
import PageTitle from '@/components/PageTitle';
import { deleteItemFromCart } from '@/lib/features/cart/cartSlice';
import { getProductsByIds } from '@/app/actions/products';

export default function CartPage() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
  const router = useRouter();
  const dispatch = useDispatch();

  // Redux items
  const { cartItems } = useSelector((state: any) => state.cart || { cartItems: {} });

  const [cartArray, setCartArray] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isResolving, startTransition] = useTransition();

  useEffect(() => {
    const productIds = Object.keys(cartItems);

    if (productIds.length === 0) {
      setCartArray([]);
      setTotalPrice(0);
      return;
    }

    startTransition(async () => {
      const result = await getProductsByIds(productIds);
      const products = result.success ? result.products : [];

      let subtotal = 0;
      const resolvedCartItems: any[] = [];

      for (const product of products) {
        const quantity = cartItems[product.id];
        if (quantity) {
          resolvedCartItems.push({ ...product, quantity });
          subtotal += product.price * (quantity as number);
        }
      }

      setCartArray(resolvedCartItems);
      setTotalPrice(subtotal);
    });
  }, [cartItems]);

  const handleDeleteItem = (productId: string) => {
    dispatch(deleteItemFromCart({ productId }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Banner />
      <Suspense fallback={<div className="h-20 bg-white border-b border-slate-200" />}>
        <Navbar />
      </Suspense>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isResolving && cartArray.length === 0 && Object.keys(cartItems).length > 0 ? (
          <div className="flex flex-col justify-center items-center py-24 space-y-4">
            <RefreshCw className="w-8 h-8 text-indigo-650 animate-spin" />
            <p className="text-xs font-extrabold text-slate-400 tracking-widest uppercase">
              Loading Your Cart...
            </p>
          </div>
        ) : cartArray.length > 0 ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Title heading */}
            <PageTitle
              heading="My Shopping Cart"
              text={`You have ${cartArray.length} items in your current session`}
              linkText="Keep shopping"
              path="/shop"
            />

            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Cart Table Container */}
              <div className="flex-1 w-full overflow-x-auto bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px] pb-4">
                      <th className="py-3 pl-2">Product details</th>
                      <th className="py-3 text-center">Quantity</th>
                      <th className="py-3 text-center">Total price</th>
                      <th className="py-3 text-center pr-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cartArray.map((item: any) => (
                      <tr key={item.id} className="group">
                        {/* Column 1: Info */}
                        <td className="py-4 pl-2 flex items-center space-x-4">
                          <div className="w-16 h-16 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                            <Image
                              src={item.images[0]}
                              alt={item.name}
                              width={48}
                              height={48}
                              className="object-contain max-h-[75%] max-w-[75%]"
                            />
                          </div>
                          <div className="space-y-1">
                            <p className="font-extrabold text-slate-800 text-sm group-hover:text-indigo-650 transition-colors">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                              {item.category}
                            </p>
                            <p className="font-bold text-slate-600">
                              {currency}
                              {item.price}
                            </p>
                          </div>
                        </td>

                        {/* Column 2: Quantity Counter */}
                        <td className="py-4 text-center">
                          <div className="inline-block scale-95">
                            <Counter productId={item.id} maxStock={item.stock} />
                          </div>
                        </td>

                        {/* Column 3: Sum */}
                        <td className="py-4 text-center font-extrabold text-slate-700">
                          {currency}
                          {(item.price * item.quantity).toLocaleString()}
                        </td>

                        {/* Column 4: Trash Delete */}
                        <td className="py-4 text-center pr-2">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-all"
                            aria-label="Remove item from cart"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Payment Invoice panel */}
              <OrderSummary totalPrice={totalPrice} items={cartArray} />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 max-w-sm mx-auto">
            <div className="w-16 h-16 bg-slate-100/80 border border-slate-200/60 rounded-3xl flex items-center justify-center text-slate-400">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-800">Your cart is currently empty</h1>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              Browse our high-end, hyperlocal collection of soundbars, smartwatches, and study accessories.
            </p>
            <button
              onClick={() => router.push('/shop')}
              className="px-6 py-3 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-full shadow-md shadow-indigo-600/10 transition-transform active:scale-95 cursor-pointer flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Browse Catalog Items</span>
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
