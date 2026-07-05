"use client";

import React, { useState, useTransition, useEffect, Suspense } from "react";
import {
  CreditCard,
  MapPin,
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Loader2,
  CheckCircle,
  Truck,
  AlertTriangle,
  Ticket
} from "lucide-react";
import Link from "next/link";
import Script from "next/script";
import { useRouter, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { createOrder, verifyRazorpayPayment } from "@/app/actions/orders";
import { getProductsByIds } from "@/app/actions/products";
import { clearCart } from "@/lib/features/cart/cartSlice";
import { couponDummyData } from "@/assets/assets";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

function CheckoutContent() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Navigation / Success states
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedOrderNum, setGeneratedOrderNum] = useState("");
  const [placedOrderId, setPlacedOrderId] = useState("");
  const [isPending, startTransition] = useTransition();

  // Form input states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("Bangalore");
  const [zipCode, setZipCode] = useState("");
  const [selectedGateway, setSelectedGateway] = useState<"razorpay" | "cod">("razorpay");
  const [formError, setFormError] = useState("");
  const [isProcessingSim, setIsProcessingSim] = useState(false);

  // Coupon carried over from the cart page's Order Summary via ?coupon=CODE
  const couponCode = searchParams.get("coupon") || "";
  const appliedCoupon = couponCode
    ? couponDummyData.find((c) => c.code.toLowerCase() === couponCode.toLowerCase()) || null
    : null;

  // Redux items
  const { cartItems } = useSelector((state: any) => state.cart || { cartItems: {} });

  const [resolvedCartItems, setResolvedCartItems] = useState<any[]>([]);
  const [isResolvingCart, setIsResolvingCart] = useState(true);

  // Resolve real cart items from the database; redirect away if the cart is empty.
  // Skipped once an order has succeeded, since placing it intentionally clears the
  // cart and would otherwise bounce the success screen straight back to /cart.
  useEffect(() => {
    if (isSuccess) return;

    const productIds = Object.keys(cartItems);

    if (productIds.length === 0) {
      router.replace("/cart");
      return;
    }

    let cancelled = false;
    setIsResolvingCart(true);

    (async () => {
      const result = await getProductsByIds(productIds);
      const products = result.success ? result.products : [];

      const list = products
        .filter((p: any) => cartItems[p.id])
        .map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          quantity: cartItems[p.id] as number,
          image: p.images?.[0] || "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
          vendorName: p.storeName || "Local Vendor",
        }));

      if (!cancelled) {
        setResolvedCartItems(list);
        setIsResolvingCart(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [cartItems, router, isSuccess]);

  // Summary Calculations
  const subtotal = resolvedCartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 100 ? 0 : 15;
  const tax = parseFloat((subtotal * 0.08).toFixed(2)); // 8% local tax
  const discountAmount = appliedCoupon ? parseFloat(((appliedCoupon.discount / 100) * subtotal).toFixed(2)) : 0;
  const totalAmount = parseFloat((subtotal + shipping + tax - discountAmount).toFixed(2));

  // Trigger celebration fireworks
  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);
  };

  // Unified payment/order submission handler
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Shipping form validation
    if (!fullName || !phone || !street || !zipCode) {
      setFormError("Please fill out all shipping details before proceeding.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      setFormError("Enter a valid 10-digit mobile number.");
      return;
    }

    setIsProcessingSim(true);

    // Prepare full address string
    const fullAddress = `${street}, ${city}, PIN: ${zipCode}. Phone: ${phone}`;

    startTransition(async () => {
      const result = await createOrder({
        totalAmount,
        address: fullAddress,
        phone,
        paymentMethod: selectedGateway,
        items: resolvedCartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      });

      if (!result.success) {
        setIsProcessingSim(false);
        setFormError(result.error || "Checkout was rejected by the server.");
        // Online payments unavailable server-side: let the user retry with one click on COD.
        if (selectedGateway === "razorpay" && result.error?.includes("Online payments are temporarily unavailable")) {
          setSelectedGateway("cod");
        }
        return;
      }

      setGeneratedOrderNum(result.orderNumber);
      setPlacedOrderId(result.orderId);

      // COD (or mock-mode): order is placed immediately, no payment step.
      if (!result.requiresPayment) {
        setIsProcessingSim(false);
        dispatch(clearCart());
        setIsSuccess(true);
        triggerConfetti();
        return;
      }

      // Mock-mode Razorpay: simulate an instant successful payment without loading the widget.
      if (result.mockPayment) {
        setIsProcessingSim(false);
        dispatch(clearCart());
        setIsSuccess(true);
        triggerConfetti();
        return;
      }

      // Real Razorpay: open the hosted checkout widget.
      if (!window.Razorpay) {
        setIsProcessingSim(false);
        setFormError("Payment gateway is still loading. Please try again in a moment.");
        return;
      }

      const razorpayCheckout = new window.Razorpay({
        key: result.razorpayKeyId,
        amount: result.amountPaise,
        currency: result.currency,
        order_id: result.razorpayOrderId,
        name: "VendorHub",
        description: `Order ${result.orderNumber}`,
        prefill: { name: fullName, contact: phone },
        handler: async (response: any) => {
          const verification = await verifyRazorpayPayment({
            orderId: result.orderId,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          setIsProcessingSim(false);

          if (verification.success) {
            dispatch(clearCart());
            setIsSuccess(true);
            triggerConfetti();
          } else {
            setFormError(verification.error || "Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessingSim(false);
            setFormError("Payment was cancelled before it completed.");
          },
        },
        theme: { color: "#4f46e5" },
      });

      razorpayCheckout.open();
    });
  };

  // Success view
  if (isSuccess) {
    return (
      <div className="w-full min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-sans">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl w-full bg-white border border-slate-200/85 p-8 sm:p-10 rounded-3xl shadow-2xl flex flex-col items-center text-center gap-6"
        >
          <div className="bg-emerald-500/10 p-4.5 rounded-full border border-emerald-500/20 shadow-lg shadow-emerald-500/10 animate-pulse">
            <CheckCircle className="h-12 w-12 text-emerald-600" />
          </div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {selectedGateway === "cod" ? "Order Placed Successfully!" : "Payment Successful!"}
            </h1>
            <p className="text-slate-500 text-sm">
              {selectedGateway === "cod"
                ? "Your Cash on Delivery order is confirmed and hyperlocally scheduled."
                : "Thank you for your purchase. Your payment has been verified."}
            </p>
          </div>

          {/* Order Details Panel */}
          <div className="w-full bg-slate-50 border border-slate-200/80 p-5 rounded-2xl flex flex-col gap-3.5 text-left text-sm">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Order Number</span>
              <span className="font-extrabold text-emerald-600 font-mono tracking-wider">{generatedOrderNum}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Amount Charged</span>
              <span className="font-extrabold text-slate-800">${totalAmount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Delivery Mode</span>
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-purple-600 animate-bounce" /> Hyperlocal Express
              </span>
            </div>
          </div>

          {/* Stepper tracking preview */}
          <div className="w-full py-4 flex flex-col gap-4">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-400">
              <span>Order Tracking Journey</span>
              <span className="text-purple-600 font-black">Status: {selectedGateway === "cod" ? "Placed" : "Confirmed"}</span>
            </div>
            <div className="flex items-center w-full justify-between relative px-2">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
              <div className="absolute top-1/2 left-0 w-1/4 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 -translate-y-1/2 z-0" />
              
              <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 text-white p-2 rounded-full border border-purple-400 shadow-md shadow-purple-500/20 z-10">
                <div className="w-3.5 h-3.5 text-[9px] font-bold flex items-center justify-center">1</div>
              </div>
              <div className="bg-slate-100 border border-slate-200 text-slate-400 p-2 rounded-full z-10">
                <div className="w-3.5 h-3.5 text-[9px] font-bold flex items-center justify-center">2</div>
              </div>
              <div className="bg-slate-100 border border-slate-200 text-slate-400 p-2 rounded-full z-10">
                <div className="w-3.5 h-3.5 text-[9px] font-bold flex items-center justify-center">3</div>
              </div>
              <div className="bg-slate-100 border border-slate-200 text-slate-400 p-2 rounded-full z-10">
                <div className="w-3.5 h-3.5 text-[9px] font-bold flex items-center justify-center">4</div>
              </div>
            </div>
            <div className="grid grid-cols-4 text-center text-[9px] font-bold text-slate-400 leading-tight">
              <span className="text-purple-600 font-extrabold">{selectedGateway === "cod" ? "Placed" : "Confirmed"}</span>
              <span>Sorted</span>
              <span>Transit</span>
              <span>Delivered</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
            <Link 
              href="/"
              className="flex-1 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 text-sm font-bold py-3.5 rounded-xl transition-all text-center"
            >
              Continue Shopping
            </Link>
            <Link
              href={placedOrderId && !placedOrderId.startsWith("mock_") ? `/orders/${placedOrderId}` : "/orders"}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/15 transition-all cursor-pointer text-center"
            >
              Track Package
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isResolvingCart) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        <p className="text-xs font-extrabold text-slate-400 tracking-widest uppercase">
          Loading Checkout...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      {/* Mini Glassmorphic Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/75 border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-slate-550 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-semibold">Back to Marketplace</span>
        </Link>
        <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-500 to-indigo-750">
          Secure Checkout
        </span>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 shadow-sm">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span>Encrypted Checkout</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Details */}
        <form onSubmit={handlePayment} className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Section 1: Shipping Details */}
          <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-md shadow-slate-100 flex flex-col gap-5">
            <h2 className="font-black text-lg text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-200">
              <MapPin className="h-5 w-5 text-purple-600" /> 1. Shipping Destination
            </h2>

            {formError && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl font-bold flex items-center gap-2">
                <AlertTriangle className="h-4.5 w-4.5" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Receiver Name</label>
                <input
                  type="text"
                  placeholder="Dharmender Chauhan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-semibold"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mobile Number</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Street Address</label>
              <input
                type="text"
                placeholder="Flat No. 402, Royal Residency, Indiranagar"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-semibold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hyperlocal Hub City</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3.5 px-4 text-sm text-slate-800 focus:outline-none transition-all cursor-pointer font-semibold"
                >
                  <option value="Bangalore">Bangalore Hub</option>
                  <option value="Srinagar">Srinagar Hub</option>
                  <option value="Mumbai">Mumbai Hub</option>
                  <option value="Delhi">Delhi Hub</option>
                  <option value="Pune">Pune Hub</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">ZIP Code / PIN</label>
                <input
                  type="text"
                  placeholder="560038"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method */}
          <div className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-md shadow-slate-100 flex flex-col gap-5">
            <h2 className="font-black text-lg text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-200">
              <CreditCard className="h-5 w-5 text-purple-600" /> 2. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Razorpay */}
              <button
                type="button"
                onClick={() => setSelectedGateway("razorpay")}
                className={`p-4.5 rounded-2xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                  selectedGateway === "razorpay"
                    ? "bg-indigo-50/50 border-indigo-500 text-indigo-950 font-bold shadow-sm shadow-indigo-100"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-slate-400">Razorpay</span>
                <span className="text-sm font-black text-slate-800">UPI / Card / Netbanking</span>
                <span className="text-[10px] text-slate-450 leading-tight">Pay securely via Razorpay's hosted checkout.</span>
              </button>

              {/* Cash on Delivery */}
              <button
                type="button"
                onClick={() => setSelectedGateway("cod")}
                className={`p-4.5 rounded-2xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                  selectedGateway === "cod"
                    ? "bg-indigo-50/50 border-indigo-500 text-indigo-950 font-bold shadow-sm shadow-indigo-100"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:border-slate-300"
                }`}
              >
                <span className="text-[9px] uppercase font-extrabold tracking-widest text-slate-400">COD Option</span>
                <span className="text-sm font-black text-slate-800">Cash on Delivery</span>
                <span className="text-[10px] text-slate-450 leading-tight">Pay the delivery driver when your package arrives.</span>
              </button>
            </div>

            <div className="border border-slate-150 rounded-2xl p-5 bg-slate-50/60 shadow-inner">
              <AnimatePresence mode="wait">
                {selectedGateway === "razorpay" ? (
                  <motion.div
                    key="razorpay"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-start gap-2.5 text-slate-600 text-xs leading-relaxed overflow-hidden"
                  >
                    <ShieldCheck className="h-4.5 w-4.5 text-indigo-600 shrink-0 mt-0.5" />
                    <p>
                      You'll be redirected to Razorpay's secure hosted checkout to complete payment via UPI, card, or netbanking.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="cod"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-emerald-50/50 border border-emerald-200 p-4 rounded-xl text-emerald-800 flex items-start gap-2.5">
                      <CheckCircle className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold text-slate-800">Cash on Delivery:</strong>
                        <p className="mt-1 text-[11px] text-emerald-700/90 font-semibold">
                          No pre-payment required. Pay the delivery driver directly when your hyperlocal package arrives.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Fulfill Action */}
            <button
              type="submit"
              disabled={isPending || isProcessingSim}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold py-4 rounded-xl shadow-lg shadow-indigo-600/15 hover:shadow-indigo-600/35 transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            >
              {isPending || isProcessingSim ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  {selectedGateway === "cod" ? "Place Order (COD)" : "Pay & Complete Order"} <ChevronRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Order Summary */}
        <aside className="lg:col-span-5 bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl shadow-md shadow-slate-100 flex flex-col gap-6 backdrop-blur-md">
          <h2 className="font-black text-lg text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-200">
            <ShoppingBag className="h-5 w-5 text-purple-600" /> Order Summary
          </h2>

          {/* Cart list representation */}
          <div className="flex flex-col gap-4">
            {resolvedCartItems.map((item) => (
              <div key={item.id} className="flex gap-4 items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex gap-3 items-center">
                  <div className="h-14 w-14 border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-col text-xs gap-0.5">
                    <strong className="text-slate-800 font-extrabold text-sm">{item.name}</strong>
                    <span className="text-[10px] text-slate-400 font-medium">Store: {item.vendorName}</span>
                    <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded w-fit mt-1">Qty: {item.quantity}</span>
                  </div>
                </div>

                <span className="font-extrabold text-slate-800 text-sm shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Calculation Subtotals */}
          <div className="flex flex-col gap-3.5 text-xs text-slate-500 pb-6 border-b border-slate-100">
            <div className="flex justify-between">
              <span>Items Subtotal:</span>
              <strong className="text-slate-700 font-bold">${subtotal.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Local Tax GST (8%):</span>
              <strong className="text-slate-700 font-bold">${tax.toFixed(2)}</strong>
            </div>
            <div className="flex justify-between">
              <span>Hyperlocal Delivery Fee:</span>
              <strong className="text-emerald-600 font-extrabold uppercase tracking-wide">Free</strong>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between items-center text-indigo-600 font-semibold bg-indigo-50/50 border border-indigo-100 p-2.5 rounded-2xl">
                <span className="flex items-center gap-1.5">
                  <Ticket className="w-3.5 h-3.5 text-indigo-500" />
                  Coupon ({appliedCoupon.code})
                </span>
                <span className="font-black text-indigo-700">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Grand Total Box */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between shadow-inner">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Amount Due</span>
              <span className="text-base font-black text-slate-800">Grand Total</span>
            </div>
            <span className="text-2xl font-black text-purple-600">${totalAmount.toFixed(2)}</span>
          </div>
        </aside>

      </main>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-extrabold text-slate-400 tracking-widest uppercase">
            Loading Checkout...
          </p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
