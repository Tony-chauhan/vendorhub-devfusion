'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import { RefreshCw, ListOrdered, Calendar, ShieldCheck, CreditCard, Tag, Eye, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderDummyData } from '@/assets/assets';

export default function StoreOrders() {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
  const [isPending, startTransition] = useTransition();

  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setOrders(orderDummyData);
  }, []);

  const updateOrderStatus = (orderId: string, nextStatus: string) => {
    startTransition(async () => {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      setOrders((prev) =>
        prev.map((o) => {
          if (o.id === orderId) {
            toast.success(`Order ${orderId.slice(0, 8)} status updated to ${nextStatus}`);
            return { ...o, status: nextStatus };
          }
          return o;
        })
      );

      // If active modal is open for this order, sync its status too
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({ ...prev, status: nextStatus }));
      }
    });
  };

  const openModal = (order: any) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedOrder(null);
    setIsModalOpen(false);
  };

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
                <th className="px-5 py-4 pl-6">ID / Index</th>
                <th className="px-5 py-4 text-left">Customer</th>
                <th className="px-5 py-4 text-center">Total Price</th>
                <th className="px-5 py-4 text-center">Payment</th>
                <th className="px-5 py-4 text-center">Coupon code</th>
                <th className="px-5 py-4 text-center">Stage Status</th>
                <th className="px-5 py-4 text-center">Date Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-650">
              {orders.map((order, idx) => (
                <tr
                  key={order.id}
                  onClick={() => openModal(order)}
                  className="hover:bg-slate-50/40 transition-colors cursor-pointer"
                >
                  <td className="py-4 pl-6 font-extrabold text-indigo-600">#{idx + 1}</td>
                  <td className="px-5 py-4 font-bold text-slate-800">{order.user?.name}</td>
                  <td className="px-5 py-4 text-center font-black text-slate-800">
                    {currency}
                    {order.total}
                  </td>
                  <td className="px-5 py-4 text-center font-bold text-slate-500">
                    {order.paymentMethod}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {order.isCouponUsed ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full">
                        <Tag className="w-2.5 h-2.5" />
                        <span>{order.coupon?.code}</span>
                      </span>
                    ) : (
                      <span className="text-slate-300 font-bold">—</span>
                    )}
                  </td>
                  <td
                    className="px-5 py-4 text-center"
                    onClick={(e) => e.stopPropagation()} // Prevent modal trigger on selector change
                  >
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="p-1.5 text-[10px] font-bold bg-slate-50 border border-slate-205 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 transition-all"
                    >
                      <option value="ORDER_PLACED">ORDER PLACED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>
                  </td>
                  <td className="px-5 py-4 text-center font-bold text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
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
            {/* Modal close */}
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
              {/* Customer Coordinates */}
              <div className="space-y-2 bg-slate-50/50 p-4 border border-slate-150 rounded-2xl">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <span>Customer Coordinates</span>
                </h3>
                <div className="text-[11px] font-semibold text-slate-600 space-y-1">
                  <p>
                    <span className="text-slate-400">Recipient:</span> {selectedOrder.user?.name}
                  </p>
                  <p>
                    <span className="text-slate-400">Email:</span> {selectedOrder.user?.email}
                  </p>
                  <p>
                    <span className="text-slate-400">Contact:</span> {selectedOrder.address?.phone}
                  </p>
                  <p className="leading-relaxed">
                    <span className="text-slate-400">Destination:</span>{' '}
                    {`${selectedOrder.address?.street}, ${selectedOrder.address?.city}, ${selectedOrder.address?.state} ${selectedOrder.address?.zip}, ${selectedOrder.address?.country}`}
                  </p>
                </div>
              </div>

              {/* Payment details */}
              <div className="space-y-2 bg-slate-50/50 p-4 border border-slate-150 rounded-2xl">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                  <span>Audit Parameters</span>
                </h3>
                <div className="text-[11px] font-semibold text-slate-600 space-y-1">
                  <p>
                    <span className="text-slate-400">Payment Gateway:</span>{' '}
                    {selectedOrder.paymentMethod}
                  </p>
                  <p>
                    <span className="text-slate-400">Paid:</span>{' '}
                    <span className="font-extrabold">{selectedOrder.isPaid ? 'YES' : 'NO'}</span>
                  </p>
                  <p>
                    <span className="text-slate-400">Coupons audited:</span>{' '}
                    {selectedOrder.isCouponUsed
                      ? `${selectedOrder.coupon?.code} (${selectedOrder.coupon?.discount}% OFF)`
                      : 'NONE'}
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

            {/* List items ordered */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Line Items Audit List
              </span>
              <div className="flex flex-col space-y-2.5 max-h-[160px] overflow-y-auto no-scrollbar">
                {selectedOrder.orderItems.map((item: any, idx: number) => (
                  <div
                    key={item.product?.id || idx}
                    className="flex items-center justify-between p-2.5 bg-white border border-slate-150 rounded-2xl"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-slate-100 border border-slate-200/50 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                        <Image
                          src={item.product?.images?.[0]?.src || item.product?.images?.[0]}
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

            {/* Actions footer */}
            <div className="flex justify-between items-center border-t border-slate-100 pt-4">
              <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-bold">
                <span>Total bill amount:</span>
                <span className="text-sm font-black text-indigo-650">
                  {currency}
                  {selectedOrder.total}
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
