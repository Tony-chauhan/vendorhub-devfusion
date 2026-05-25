'use client';

import React, { Suspense } from 'react';
import { ShieldCheck, Zap, Sparkles, Check, HelpCircle, Users } from 'lucide-react';
import Banner from '@/components/Banner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const handleSelectTier = (tier: string) => {
    toast.success(`Simulating subscription to "${tier}" plan in demo mode!`);
  };

  const plans = [
    {
      name: 'Starter Merchant',
      price: 'Free',
      description: 'Perfect for small local suppliers starting out.',
      features: [
        'List up to 15 hyperlocal products',
        'Standard dashboard tracking',
        'Hyperlocal customer matching',
        '2.5% transaction commission',
      ],
      icon: Users,
      cta: 'Get Started Free',
      accent: false,
    },
    {
      name: 'VendorHub Plus Partner',
      price: '$19',
      period: '/ month',
      description: 'Highly recommended for growing local shops and tech stores.',
      features: [
        'List unlimited product catalog',
        'Gemini AI Pricing & Marketing Advisor',
        'Priority placement in search chips',
        'Exclusive "VendorHub. Plus" vendor badge',
        '0% commission on Stripe checkout',
        'Premium customer support (24/7)',
      ],
      icon: Sparkles,
      cta: 'Upgrade to Plus',
      accent: true,
    },
    {
      name: 'Enterprise Hub',
      price: '$49',
      period: '/ month',
      description: 'Engineered for multi-warehouse suppliers and franchise partners.',
      features: [
        'Everything in Plus package',
        'Custom subdomain integrations',
        'API key tokens for bulk inventory syncing',
        'Tailored Inngest workflow metrics',
        'Advanced monthly AI market demand reviews',
      ],
      icon: Zap,
      cta: 'Contact Partner Hub',
      accent: false,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900">
      <Banner />
      <Suspense fallback={<div className="h-20 bg-white border-b border-slate-200" />}>
        <Navbar />
      </Suspense>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-50 border border-indigo-150 rounded-full">
            Pricing Plans
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Elevate Your Local Business
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-semibold leading-relaxed">
            Choose the ideal subscription tier to onboard your storefront, list inventory, and access the advanced Gemini AI pricing analysis.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-stretch">
          {plans.map((plan, idx) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col justify-between p-8 bg-white border rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 ${
                  plan.accent
                    ? 'border-indigo-500 ring-2 ring-indigo-500/10'
                    : 'border-slate-200/80'
                }`}
              >
                {plan.accent && (
                  <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white bg-indigo-600 rounded-full shadow-sm">
                    Most Popular Curation
                  </span>
                )}

                <div className="space-y-6">
                  {/* Icon & Plan name */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-sm ${
                        plan.accent
                          ? 'bg-indigo-50 border-indigo-100 text-indigo-600'
                          : 'bg-slate-50 border-slate-200 text-slate-500'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Plan {idx + 1}
                    </span>
                  </div>

                  {/* Header info */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-extrabold text-slate-800">{plan.name}</h3>
                    <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Pricing cost */}
                  <div className="flex items-baseline space-x-1 border-b border-slate-100 pb-4">
                    <span className="text-3xl font-black text-slate-900 tracking-tight">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="text-xs text-slate-400 font-bold">{plan.period}</span>
                    )}
                  </div>

                  {/* Features list */}
                  <ul className="space-y-3.5 pt-2">
                    {plan.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-start space-x-2.5">
                        <Check
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            plan.accent ? 'text-indigo-650' : 'text-slate-450'
                          }`}
                        />
                        <span className="text-xs text-slate-500 font-semibold leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => handleSelectTier(plan.name)}
                    className={`w-full py-3 text-xs font-bold rounded-full transition-all cursor-pointer hover:scale-[1.01] active:scale-95 flex items-center justify-center space-x-1.5 ${
                      plan.accent
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10'
                        : 'bg-slate-100 hover:bg-slate-150 border border-slate-205 text-slate-650'
                    }`}
                  >
                    <span>{plan.cta}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Security / FAQ small footer */}
        <div className="max-w-xl mx-auto text-center space-y-4 border-t border-slate-200 pt-12">
          <div className="inline-flex items-center space-x-1.5 text-xs text-slate-450 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>All Merchant Subscriptions are backed by secure Stripe evaluation simulation modules.</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
