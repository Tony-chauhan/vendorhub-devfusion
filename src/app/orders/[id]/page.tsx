import React from "react";
import {
  ArrowLeft,
  MapPin,
  Package,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Store
} from "lucide-react";
import Link from "next/link";
import { forbidden, unauthorized } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { customCurrentUser as currentUser } from "@/lib/clerk-server";
import { isMockDb } from "@/lib/env";
import RequestRefundButton from "@/components/RequestRefundButton";

interface OrderTrackingProps {
  params: Promise<{ id: string }>;
}

export default async function OrderTrackingPage({ params }: OrderTrackingProps) {
  const resolvedParams = await params;
  const orderId = resolvedParams.id;

  // 1. Fetch Order details from Neon Postgres
  let order = null;
  try {
    order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: true,
        refund: true,
        orderItems: {
          include: {
            product: {
              include: {
                store: true
              }
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("Order fetch error:", error);
  }

  // 1b. Ownership check — this page renders a buyer's name and delivery
  // address, so it must never be reachable by guessing/enumerating another
  // buyer's order ID. Skipped in mock-DB mode since there's no real
  // multi-tenant data to leak there.
  if (order && !isMockDb()) {
    const clerkUser = await currentUser();
    if (!clerkUser) unauthorized();

    const viewer = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { id: true, role: true },
    });

    if (!viewer || (viewer.role !== "ADMIN" && viewer.id !== order.buyerId)) {
      forbidden();
    }
  }

  // 2. Access Denied / Not Found View
  if (!order) {
    return (
      <div className="w-full min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden font-sans">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-md w-full bg-white border border-slate-200 p-8 rounded-3xl backdrop-blur-md text-center flex flex-col items-center gap-5 shadow-2xl">
          <AlertTriangle className="h-12 w-12 text-orange-500 animate-bounce" />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-black text-slate-900">Order Not Found</h1>
            <p className="text-xs text-slate-500">We couldn't retrieve order details for ID: <strong className="text-slate-750">{orderId}</strong>.</p>
          </div>
          <Link 
            href="/"
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold py-3 rounded-xl transition-all text-xs text-center flex items-center justify-center cursor-pointer"
          >
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Determine active step index based on order status enum
  const STATUS_STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/75 border-b border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-sm">
        <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm font-semibold">Back to Hub</span>
        </Link>
        <span className="font-extrabold text-xl bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-indigo-500 to-indigo-700">
          Hyperlocal Courier Tracker
        </span>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          Live Sync
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl mx-auto px-6 py-16 flex flex-col gap-8">
        
        {/* Visual Stepper Card */}
        <section className="bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl backdrop-blur-sm flex flex-col gap-8 shadow-md shadow-slate-100">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200/80">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tracking Reference</span>
              <h2 className="font-mono text-lg font-extrabold text-slate-900 tracking-widest">{order.orderNumber}</h2>
            </div>
            
            <div className="flex flex-col sm:items-end gap-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-left sm:text-right">Operational Status</span>
              <span className="text-sm font-black text-purple-600 uppercase tracking-wider">{order.status}</span>
            </div>
          </div>

          {/* PROGRESS STEPPER */}
          <div className="w-full py-6 flex flex-col gap-6">
            {/* Visual Progress bar line */}
            <div className="flex items-center w-full justify-between relative px-6 sm:px-12">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 -translate-y-1/2 z-0 transition-all duration-500" 
                style={{ width: `${(currentStepIndex / 3) * 100}%` }}
              />

              {STATUS_STEPS.map((step, idx) => {
                const isActive = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div 
                    key={step}
                    className={`relative z-10 p-3 rounded-full border transition-all duration-300 ${
                      isCurrent
                        ? "bg-gradient-to-tr from-purple-600 to-indigo-600 border-purple-400 text-white shadow-lg shadow-indigo-505/20 scale-110 animate-pulse"
                        : isActive
                        ? "bg-indigo-50 border-indigo-200 text-indigo-600"
                        : "bg-white border-slate-200 text-slate-400"
                    }`}
                  >
                    <div className="w-4 h-4 text-xs font-bold flex items-center justify-center">
                      {idx < currentStepIndex ? <CheckCircle2 className="h-4.5 w-4.5 text-indigo-505" /> : idx + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Stepper Labels */}
            <div className="grid grid-cols-4 text-center text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-slate-400 leading-tight">
              <span className={currentStepIndex >= 0 ? "text-purple-600 font-black" : ""}>Placed</span>
              <span className={currentStepIndex >= 1 ? "text-purple-600 font-black" : ""}>Confirmed</span>
              <span className={currentStepIndex >= 2 ? "text-purple-600 font-black" : ""}>Shipped</span>
              <span className={currentStepIndex >= 3 ? "text-purple-600 font-black" : ""}>Delivered</span>
            </div>
          </div>
        </section>

        {/* Details and items */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Order Items */}
          <section className="md:col-span-7 bg-white border border-slate-200/80 p-6 sm:p-8 rounded-3xl backdrop-blur-sm flex flex-col gap-6 shadow-sm">
            <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-200/80">
              <Package className="h-5 w-5 text-purple-600" /> Package Contents
            </h3>

            <div className="flex flex-col gap-4">
              {order.orderItems.map((item) => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="h-16 w-16 rounded-xl border border-slate-200 overflow-hidden shrink-0">
                    <img 
                      src={item.product?.images?.[0] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&auto=format&fit=crop&q=80"} 
                      alt={item.product?.name || "Product Item"} 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-0.5 justify-center text-sm">
                    <h4 className="font-bold text-slate-800 leading-tight">{item.product?.name || "Product Item"}</h4>
                    <span className="text-[10px] text-slate-450 flex items-center gap-1">
                      <Store className="h-3 w-3 text-purple-500" /> Store: {item.product?.store?.name || "Local Vendor"}
                    </span>
                    <span className="text-xs text-slate-500">Qty: {item.quantity}</span>
                  </div>
                  <span className="text-slate-900 font-extrabold text-sm shrink-0">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-200/80 text-xs font-bold text-slate-500">
              <span>Subtotal Charged</span>
              <span className="text-slate-900 font-black text-sm">${order.totalAmount}</span>
            </div>
          </section>

          {/* Delivery & Vendor details */}
          <aside className="md:col-span-5 flex flex-col gap-6">
            
            {/* Delivery address */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl backdrop-blur-sm flex flex-col gap-4 shadow-sm">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200/80">
                <MapPin className="h-4.5 w-4.5 text-purple-600" /> Delivery Address
              </h3>
              <div className="text-xs text-slate-500 leading-relaxed flex flex-col gap-1 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[9px] mb-1">Destination</span>
                <p className="font-semibold text-slate-800">{order.buyer?.name}</p>
                <p className="mt-1 leading-loose">{order.address}</p>
              </div>
            </div>

            {/* Courier hub */}
            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl backdrop-blur-sm flex flex-col gap-4 shadow-sm">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200/80">
                <Truck className="h-4.5 w-4.5 text-purple-600" /> Hyperlocal Logistics Hub
              </h3>
              <div className="text-xs text-slate-500 leading-relaxed flex flex-col gap-2 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                <div className="flex justify-between text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                  <span>Operational Hub</span>
                  <span className="text-indigo-600 font-bold">Active</span>
                </div>
                <div className="flex items-center gap-3 font-semibold text-slate-800 mt-1">
                  <Clock className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="leading-tight font-bold">Estimated Delivery Hub</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Sameday Courier Express (2-4 hours)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Refund request */}
            {order.status === "DELIVERED" && (
              <div className="bg-white border border-slate-200/80 p-6 rounded-3xl backdrop-blur-sm flex flex-col gap-4 shadow-sm">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200/80">
                  Need Something Fixed?
                </h3>
                {order.refund ? (
                  <div className="text-xs font-bold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    Refund request status: <span className="uppercase">{order.refund.status}</span>
                  </div>
                ) : (
                  <RequestRefundButton orderId={order.id} />
                )}
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
