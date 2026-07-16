'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Dot, ChevronRight, Truck } from 'lucide-react';
import Rating from './Rating';
import RatingModal from './RatingModal';

interface OrderItemProps {
  order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    address: string;
    orderItems: Array<{
      id: string;
      quantity: number;
      price: number;
      product: {
        id: string;
        name: string;
        images: string[];
        category: string;
      };
      review: { id: string; rating: number; comment: string | null } | null;
    }>;
  };
  onReviewSubmitted?: () => void;
}

export default function OrderItem({ order, onReviewSubmitted }: OrderItemProps) {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
  const [activeRateProductId, setActiveRateProductId] = useState<string | null>(null);

  const isDelivered = order.status.toUpperCase() === 'DELIVERED';

  return (
    <>
      <tr className="text-xs text-slate-500 hover:bg-slate-50/40 transition-colors">
        {/* Products Column */}
        <td className="py-6 pl-2 text-left">
          <div className="flex flex-col space-y-5">
            {order.orderItems.map((item, idx) => {
              const ratingObject = item.review;

              return (
                <div key={item.product.id || idx} className="flex items-center space-x-3.5">
                  <div className="w-14 h-14 bg-slate-100 border border-slate-200/50 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      width={36}
                      height={36}
                      className="object-contain max-h-[80%] max-w-[80%]"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="font-extrabold text-slate-800 text-xs sm:text-sm">
                      {item.product.name}
                    </p>
                    <p className="font-semibold text-slate-400">
                      {currency}
                      {item.price} • Qty: {item.quantity}
                    </p>
                    <p className="text-[10px] text-slate-350 font-bold uppercase tracking-wider">
                      Ordered: {new Date(order.createdAt).toDateString()}
                    </p>
                    <div className="pt-0.5">
                      {ratingObject ? (
                        <div className="flex items-center space-x-1">
                          <Rating value={ratingObject.rating} />
                          <span className="text-[10px] text-slate-400 font-semibold">(Your Review)</span>
                        </div>
                      ) : (
                        isDelivered && (
                          <button
                            onClick={() => setActiveRateProductId(item.product.id)}
                            className="inline-flex items-center space-x-0.5 text-indigo-650 hover:underline font-extrabold text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            <span>Rate Product</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </td>

        {/* Total Price Column */}
        <td className="py-6 text-center font-black text-slate-800 text-xs sm:text-sm max-md:hidden">
          {currency}
          {order.totalAmount.toLocaleString()}
        </td>

        {/* Shipping Destination Column */}
        <td className="py-6 text-left leading-relaxed text-slate-450 font-semibold max-md:hidden">
          <p className="font-extrabold text-slate-700">{order.orderNumber}</p>
          <p className="truncate max-w-[180px]">{order.address}</p>
        </td>

        {/* Status Indicator Column */}
        <td className="py-6 text-center max-md:hidden">
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`inline-flex items-center space-x-1 rounded-full px-3 py-1 font-bold ${
                isDelivered
                  ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                  : 'text-amber-700 bg-amber-50 border border-amber-100'
              }`}
            >
              <Dot className={`w-4 h-4 -ml-1 ${isDelivered ? 'text-emerald-500' : 'text-amber-500'}`} />
              <span className="text-[10px] uppercase tracking-wider">
                {order.status.split('_').join(' ').toLowerCase()}
              </span>
            </div>
            <Link
              href={`/orders/${order.id}`}
              className="inline-flex items-center space-x-1 text-indigo-650 hover:underline font-extrabold text-[10px] uppercase tracking-wider cursor-pointer"
            >
              <Truck className="w-3 h-3" />
              <span>Track Order</span>
            </Link>
          </div>
        </td>
      </tr>

      {/* Mobile View Shipping Row */}
      <tr className="md:hidden">
        <td colSpan={4} className="py-3 px-2 border-t border-slate-100 bg-slate-50/45 text-slate-500">
          <div className="space-y-1 bg-white p-4 border border-slate-200/50 rounded-2xl">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">
              Shipping coordinates
            </span>
            <p className="font-bold text-slate-700">{order.orderNumber}</p>
            <p>{order.address}</p>
            <div className="pt-2 flex items-center justify-between border-t border-slate-100 mt-2">
              <span className="text-xs font-black text-slate-700">Total bill: {currency}{order.totalAmount}</span>
              <span
                className={`px-3 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${
                  isDelivered ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                }`}
              >
                {order.status.replace(/_/g, ' ').toLowerCase()}
              </span>
            </div>
            <Link
              href={`/orders/${order.id}`}
              className="inline-flex items-center space-x-1 text-indigo-650 hover:underline font-extrabold text-[10px] uppercase tracking-wider cursor-pointer mt-2"
            >
              <Truck className="w-3 h-3" />
              <span>Track Order</span>
            </Link>
          </div>
        </td>
      </tr>

      {/* Spacing spacer row */}
      <tr>
        <td colSpan={4} className="py-1">
          <div className="border-b border-slate-100 w-full" />
        </td>
      </tr>

      {/* Rating modal triggers */}
      {activeRateProductId && (
        <RatingModal
          productId={activeRateProductId}
          onClose={() => setActiveRateProductId(null)}
          onSuccess={onReviewSubmitted}
        />
      )}
    </>
  );
}
