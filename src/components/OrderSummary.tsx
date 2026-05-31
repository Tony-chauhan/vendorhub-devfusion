'use client';

import React, { useState } from 'react';
import { Plus, CheckSquare, X, ShieldCheck, Ticket } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import AddressModal from './AddressModal';
import { couponDummyData } from '@/assets/assets';
import { clearCart } from '@/lib/features/cart/cartSlice';

interface OrderSummaryProps {
  totalPrice: number;
  items: any[];
}

export default function OrderSummary({ totalPrice, items }: OrderSummaryProps) {
  const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$';
  const router = useRouter();
  const dispatch = useDispatch();

  // Redux state
  const addressList = useSelector((state: any) => state.address?.list || []);

  // Component local states
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'STRIPE'>('COD');
  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [coupon, setCoupon] = useState<any>(null);

  const handleCouponCode = (event: React.FormEvent) => {
    event.preventDefault();
    if (!couponCodeInput.trim()) return;

    const matched = couponDummyData.find(
      (c) => c.code.toLowerCase() === couponCodeInput.trim().toLowerCase()
    );

    if (matched) {
      setCoupon(matched);
      toast.success(`Coupon Applied: ${matched.description}`);
      setCouponCodeInput('');
    } else {
      toast.error('Invalid coupon code! Try "NEW20", "PLUS10", or "OFF20"');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddress) {
      toast.error('Please select or add a shipping destination first');
      return;
    }

    if (paymentMethod === 'STRIPE') {
      toast.success('Redirecting to secure Stripe payment sandbox...');
      router.push('/checkout');
      return;
    }

    // Save custom checkout order in localStorage so it appears in My Orders
    const newOrder = {
      id: `order_${Math.floor(100000 + Math.random() * 900000)}`,
      total: parseFloat(finalPrice.toFixed(2)),
      status: "PLACED",
      createdAt: new Date().toISOString(),
      address: selectedAddress,
      orderItems: items.map((item) => ({
        price: item.price,
        quantity: item.quantity,
        product: {
          id: item.id,
          name: item.name,
          images: item.images,
          category: item.category
        }
      })),
      user: {
        name: "Dharmender Chauhan"
      }
    };

    if (typeof window !== 'undefined') {
      const savedOrdersStr = localStorage.getItem('vendorhub_sandbox_orders');
      let localOrders: any[] = [];
      if (savedOrdersStr) {
        try {
          localOrders = JSON.parse(savedOrdersStr);
        } catch (err) {}
      }
      localOrders.unshift(newOrder);
      localStorage.setItem('vendorhub_sandbox_orders', JSON.stringify(localOrders));
    }

    const placePromise = new Promise((resolve) => {
      setTimeout(() => {
        dispatch(clearCart());
        resolve(true);
      }, 1200);
    });

    toast.promise(placePromise, {
      loading: 'Authorizing transaction with hyperlocal node...',
      success: () => {
        router.push('/orders');
        return 'Order placed successfully! Happy shopping.';
      },
      error: 'Order validation failed. Try again.',
    });
  };

  // Discount Math
  const discountAmount = coupon ? (coupon.discount / 100) * totalPrice : 0;
  const finalPrice = totalPrice - discountAmount;

  return (
    <div className="w-full max-w-lg lg:max-w-[350px] bg-white border border-slate-205 text-xs text-slate-500 rounded-3xl p-6 sm:p-8 shadow-md flex flex-col space-y-5 animate-in fade-in duration-300">
      <h2 className="text-base font-extrabold text-slate-800">Order Summary</h2>

      {/* Payment Selector */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Payment Method
        </span>
        <div className="space-y-2">
          <label className="flex items-center space-x-3 cursor-pointer p-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-2xl transition-colors">
            <input
              type="radio"
              name="payment"
              onChange={() => setPaymentMethod('COD')}
              checked={paymentMethod === 'COD'}
              className="accent-indigo-650"
            />
            <span className="font-extrabold text-slate-700">Cash on Delivery (COD)</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer p-2.5 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-2xl transition-colors">
            <input
              type="radio"
              name="payment"
              onChange={() => setPaymentMethod('STRIPE')}
              checked={paymentMethod === 'STRIPE'}
              className="accent-indigo-650"
            />
            <span className="font-extrabold text-slate-700">Secure Stripe Payment</span>
          </label>
        </div>
      </div>

      {/* Shipping Address Selector */}
      <div className="border-t border-slate-100 pt-4 space-y-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
          Shipping Address
        </span>

        {selectedAddress ? (
          <div className="flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
            <div className="space-y-0.5">
              <p className="font-extrabold text-indigo-950 truncate max-w-[180px]">
                {selectedAddress.name}
              </p>
              <p className="text-[10px] text-indigo-700/80 truncate max-w-[200px]">
                {selectedAddress.street}, {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}
              </p>
            </div>
            <button
              onClick={() => setSelectedAddress(null)}
              className="p-1.5 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {addressList.length > 0 ? (
              <select
                className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all font-semibold"
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedAddress(val !== '' ? addressList[Number(val)] : null);
                }}
                defaultValue=""
              >
                <option value="">-- Choose Shipping Address --</option>
                {addressList.map((addr: any, idx: number) => (
                  <option key={addr.id || idx} value={idx}>
                    {addr.name} ({addr.street}, {addr.city})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-[10px] text-slate-400 font-semibold italic">
                No delivery locations loaded. Add one to checkout.
              </p>
            )}
            <button
              onClick={() => setShowAddressModal(true)}
              className="inline-flex items-center space-x-1.5 text-indigo-650 hover:underline font-bold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Shipping Address</span>
            </button>
          </div>
        )}
      </div>

      {/* Bill Breakdown */}
      <div className="border-t border-slate-100 pt-4 space-y-2.5">
        <div className="flex justify-between items-center text-slate-400 font-semibold">
          <span>Subtotal</span>
          <span className="text-slate-800 font-black">
            {currency}
            {totalPrice.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between items-center text-slate-400 font-semibold">
          <span>Hyperlocal Delivery</span>
          <span className="text-emerald-600 font-extrabold uppercase">FREE</span>
        </div>

        {coupon && (
          <div className="flex justify-between items-center text-indigo-600 font-semibold bg-indigo-50/50 border border-indigo-100 p-2.5 rounded-2xl">
            <span className="flex items-center space-x-1">
              <Ticket className="w-3.5 h-3.5 text-indigo-500" />
              <span>Coupon ({coupon.code})</span>
            </span>
            <span className="font-black text-indigo-700">
              -{currency}
              {discountAmount.toFixed(2)}
            </span>
          </div>
        )}

        {/* Coupon Code Form */}
        {!coupon ? (
          <form onSubmit={handleCouponCode} className="flex gap-2 pt-1.5">
            <input
              type="text"
              placeholder="e.g. NEW20"
              value={couponCodeInput}
              onChange={(e) => setCouponCodeInput(e.target.value)}
              className="flex-1 p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-850 transition-all font-semibold placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
            >
              Apply
            </button>
          </form>
        ) : (
          <div className="flex items-center justify-between bg-indigo-50/40 p-2.5 rounded-2xl border border-indigo-100/50">
            <div>
              <p className="text-[10px] font-black text-indigo-700 uppercase">{coupon.code}</p>
              <p className="text-[9px] text-slate-400 font-semibold mt-0.5">{coupon.description}</p>
            </div>
            <button
              onClick={() => setCoupon(null)}
              className="text-slate-400 hover:text-rose-500 p-1 rounded-full cursor-pointer hover:bg-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Bill total & trigger button */}
      <div className="border-t border-slate-100 pt-4 flex flex-col space-y-4">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-black text-slate-700">Total Bill Amount</span>
          <span className="text-xl font-black text-indigo-600 tracking-tight">
            {currency}
            {finalPrice.toFixed(2)}
          </span>
        </div>

        <button
          onClick={handlePlaceOrder}
          className="w-full py-3.5 bg-slate-900 hover:bg-slate-950 text-white font-bold text-xs rounded-full shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center space-x-2"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-450" />
          <span>Confirm & Place Order</span>
        </button>
      </div>

      {showAddressModal && <AddressModal onClose={() => setShowAddressModal(false)} />}
    </div>
  );
}
