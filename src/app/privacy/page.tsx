'use client';

import React, { Suspense } from 'react';
import { ShieldCheck, Eye, Lock, FileText, Globe, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Banner from '@/components/Banner';
import { motion } from 'framer-motion';

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: ShieldCheck,
      title: "1. Privacy Shield & Hyperlocal Operations",
      content: "At VendorHub, your privacy is our primary commitment. When you connect with local merchants and neighborhood stores through our multi-vendor catalog, we prioritize securing your transaction data. We implement cryptographic protocols to shield transaction histories and ensure merchant-buyer communications remain strictly private."
    },
    {
      icon: Eye,
      title: "2. Data Transparency & Localization",
      content: "We only collect data necessary to facilitate high-performance hyperlocal commerce. This includes approximate delivery location details to calculate regional shipping fees and active storefront inventories. Your location coordinates are processed strictly in memory and are never sold, rented, or distributed to third-party advertisers."
    },
    {
      icon: Lock,
      title: "3. Secure Escrow & Payments Security",
      content: "All payments processed via VendorHub utilize serverless relational database failsafes and top-tier security gateways. Your credit card information, cash-on-delivery logs, and store credit transactions are fully tokenized and safeguarded. We do not store raw card numbers or payment details on our local database servers."
    },
    {
      icon: FileText,
      title: "4. Gemini AI Recommendation & Optimization Consent",
      content: "Our Generative AI suite (such as search synonym expanders, complementary bundle suggestions, and vendor copywriting advisors) relies on anonymized transaction metadata. We do not transmit personal identifiable information (PII) to AI inference endpoints. You maintain full ownership of your catalog descriptions and merchant data inputs."
    },
    {
      icon: Globe,
      title: "5. Compliance & International Standards",
      content: "VendorHub is fully optimized to align with regional digital privacy frameworks and international multi-tenant e-commerce standard guidelines. Users have the right to request full deletion of their customer profile accounts, merchant analytical histories, and active store listings at any time by contacting our helpline."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      <Banner />
      
      <Suspense fallback={<div className="h-20 bg-white border-b border-slate-200" />}>
        <Navbar />
      </Suspense>

      <main className="flex-grow max-w-4xl w-full mx-auto px-4 sm:px-6 py-12">
        {/* Back Link */}
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center space-x-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </Link>
        </div>

        {/* Header Block */}
        <div className="text-center mb-16 space-y-4">
          <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100/50 mx-auto shadow-sm">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Last Updated: May 26, 2026 • Version 2.0.2
          </p>
          <div className="max-w-2xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent my-6" />
        </div>

        {/* Content Glass Cards */}
        <div className="space-y-8 mb-16">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex gap-6 items-start hover:shadow-md transition-all duration-300"
              >
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100/50 shrink-0 shadow-sm">
                  <Icon className="w-5.5 h-5.5" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">{section.title}</h2>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">{section.content}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Help Desk Footer Alert */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 text-center max-w-2xl mx-auto mb-8">
          <p className="text-xs text-indigo-800 font-bold leading-relaxed">
            Have questions regarding our multi-vendor privacy practices or localized data processing? 
            <br />
            Our customer helpline is active 24/7 at <a href="mailto:support@vendorhub.plus" className="underline hover:text-indigo-900 font-extrabold">support@vendorhub.plus</a>.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
