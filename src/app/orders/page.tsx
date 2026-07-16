'use client';

import React, { useEffect, useState, Suspense, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import Banner from '@/components/Banner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PageTitle from '@/components/PageTitle';
import OrderItem from '@/components/OrderItem';
import { getMyOrders } from '@/app/actions/orders';

export default function OrdersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(() => {
    setLoading(true);
    getMyOrders().then((result) => {
      if (result.success) {
        setOrders(result.orders);
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [loadOrders]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Banner />
      <Suspense fallback={<div className="h-20 bg-white border-b border-slate-200" />}>
        <Navbar />
      </Suspense>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col justify-center items-center py-24 space-y-4">
            <RefreshCw className="w-8 h-8 text-indigo-650 animate-spin" />
            <p className="text-xs font-extrabold text-slate-400 tracking-widest uppercase">
              Loading Your Orders...
            </p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <PageTitle
              heading="My Orders"
              text={`Showing total ${orders.length} hyperlocal orders placed`}
              linkText="Back to shop"
              path="/shop"
            />

            <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm overflow-x-auto">
              <table className="w-full text-xs text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase tracking-wider text-[10px] max-md:hidden">
                    <th className="pb-3 pl-2 text-left">Ordered Products</th>
                    <th className="pb-3 text-center">Total Price</th>
                    <th className="pb-3 text-left">Delivery Address</th>
                    <th className="pb-3 text-center">Dispatch Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <OrderItem key={order.id} order={order} onReviewSubmitted={loadOrders} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 max-w-sm mx-auto">
            <div className="w-16 h-16 bg-slate-100 border border-slate-200/60 rounded-3xl flex items-center justify-center text-slate-400">
              📦
            </div>
            <h1 className="text-xl font-extrabold text-slate-800">No Orders Placed Yet</h1>
            <p className="text-xs text-slate-400 leading-relaxed font-semibold">
              You haven&apos;t completed any transaction checkouts in this session yet. Explore the shop catalog.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
