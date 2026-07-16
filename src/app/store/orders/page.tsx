'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import { RefreshCw, ListOrdered, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getVendorOrders, updateOrderStatus } from '@/app/actions/orders';

const STATUS_STEPS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'] as const;

export default function StoreOrders() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadOrders = () => {
    setLoading(true);
    getVendorOrders().then((result) => {
      if (result.success) {
        setOrders(result.orders);
      } else {
        toast.error(result.error);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadOrders();
  }, []);

  const handleUpdateStatus = (orderId: string, nextStatus: 'CONFIRMED' | 'SHIPPED' | 'DELIVERED') => {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, nextStatus);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(`Order status updated to ${nextStatus}`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setSelectedOrder((prev: any) => ({ ...prev, status: nextStatus }));
      }
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openModal = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          Loading orders...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            Customer Orders Inbox
          </h1>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Audit incoming customer cart requests, update delivery stages, and check payments
          </p>
        </div>
        {isPending && <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />}
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-lg shadow-sm">
          <ListOrdered className="w-10 h-10 text-slate-350 mx-auto mb-3" />
          <h4 className="text-sm font-extrabold text-slate-700">No Orders Available</h4>
          <p className="text-xs text-slate-400 mt-1 font-semibold">
            Merchant orders will auto-populate as buyers perform checkout flows.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm max-w-4xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="px-5 py-4 pl-6">Order #</th>
                <th className="px-5 py-4 text-left">Customer</th>
                <th className="px-5 py-4 text-center">Total Price</th>
                <th className="px-5 py-4 text-center">Payment</th>
                <th className="px-5 py-4 text-center">Stage Status</th>
                <th className="px-5 py-4 text-center">Date Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-650">
              {orders.map((order) => {
                const currentIndex = STATUS_STEPS.indexOf(order.status);

                return (
                  <tr
                    key={order.id}
                    onClick={() => openModal(order)}
                    className="hover:bg-slate-50/40 transition-colors cursor-pointer"
                  >
                    <td className="py-4 pl-6 font-extrabold text-indigo-600">{order.orderNumber}</td>
                    <td className="px-5 py-4 font-bold text-slate-800">{order.buyer?.name}</td>
                    <td className="px-5 py-4 text-center font-black text-slate-800">
                      {currency}
                      {order.totalAmount}
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-slate-500">
                      {order.paymentGateway}
                    </td>
                    <td
                      className="px-5 py-4 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateStatus(order.id, e.target.value as 'CONFIRMED' | 'SHIPPED' | 'DELIVERED')
                        }
                        className="p-1.5 text-[10px] font-bold bg-slate-50 border border-slate-205 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 transition-all"
                      >
                        {STATUS_STEPS.map((step, idx) => (
                          <option key={step} value={step} disabled={idx <= currentIndex && step !== order.status}>
                            {step}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-4 text-center font-bold text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detailed view Modal */}
      {isModalOpen && selectedOrder && (
        <div
          onClick={closeModal}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl relative animate-in fade-in zoom-in-95 duration-200 space-y-6"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-base font-extrabold text-slate-900 text-center border-b border-slate-100 pb-3">
              Merchant Order Audit Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 bg-slate-50/50 p-4 border border-slate-150 rounded-2xl">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <span>Customer Coordinates</span>
                </h3>
                <div className="text-[11px] font-semibold text-slate-600 space-y-1">
                  <p>
                    <span className="text-slate-400">Recipient:</span> {selectedOrder.buyer?.name}
                  </p>
                  <p>
                    <span className="text-slate-400">Email:</span> {selectedOrder.buyer?.email}
                  </p>
                  <p className="leading-relaxed">
                    <span className="text-slate-400">Destination:</span> {selectedOrder.address}
                  </p>
                </div>
              </div>

              <div className="space-y-2 bg-slate-50/50 p-4 border border-slate-150 rounded-2xl">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Audit Parameters</span>
                </h3>
                <div className="text-[11px] font-semibold text-slate-600 space-y-1">
                  <p>
                    <span className="text-slate-400">Payment Gateway:</span>{' '}
                    {selectedOrder.paymentGateway}
                  </p>
                  <p>
                    <span className="text-slate-400">Payment Status:</span>{' '}
                    <span className="font-extrabold">{selectedOrder.paymentStatus}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Dispatch stage:</span>{' '}
                    <span className="font-black text-indigo-700">{selectedOrder.status}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Creation date:</span>{' '}
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Line Items Audit List
              </span>
              <div className="flex flex-col space-y-2.5 max-h-[160px] overflow-y-auto no-scrollbar">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {selectedOrder.orderItems.map((item: any, idx: number) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between p-2.5 bg-white border border-slate-150 rounded-2xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-100 border border-slate-200/50 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                        <Image
                          src={item.product?.images?.[0]}
                          alt={item.product?.name}
                          width={32}
                          height={32}
                          className="object-contain max-h-[85%] max-w-[85%]"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 truncate max-w-[220px]">
                          {item.product?.name}
                        </p>
                        <p className="text-[9px] text-slate-400 font-bold">
                          Qty: {item.quantity} • Unit price: {currency}
                          {item.price}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-800">
                        {currency}
                        {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-slate-100 pt-4">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-bold">
                <span>Total bill amount:</span>
                <span className="text-sm font-black text-indigo-650">
                  {currency}
                  {selectedOrder.totalAmount}
                </span>
              </div>
              <button
                onClick={closeModal}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-150 border border-slate-205 text-slate-700 text-xs font-bold rounded-full transition-colors cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
