'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Home, ShieldAlert, Store, Percent, ArrowLeft } from 'lucide-react';
import { assets } from '@/assets/assets';

export default function AdminSidebar() {
  const pathname = usePathname();

  const sidebarLinks = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Active Stores', href: '/admin/stores', icon: Store },
    { name: 'Verify Merchant', href: '/admin/approve', icon: ShieldAlert },
    { name: 'Moderate Coupons', href: '/admin/coupons', icon: Percent },
  ];

  return (
    <div className="inline-flex h-full flex-col justify-between border-r border-slate-200/80 bg-white sm:min-w-64 z-10 py-6">
      <div className="flex flex-col space-y-6">
        {/* Moderator Profile Header */}
        <div className="flex flex-col gap-3 justify-center items-center px-4 max-sm:hidden">
          <div className="relative w-14 h-14 bg-slate-50 border border-slate-200/60 rounded-full flex items-center justify-center overflow-hidden shadow-sm">
            <Image
              src={assets.gs_logo}
              alt="Dharmender Chauhan Admin"
              fill
              className="object-cover"
            />
          </div>
          <p className="text-slate-800 font-extrabold text-sm text-center">
            Hi, Dharmender Chauhan
          </p>
        </div>

        {/* Action Link List */}
        <div className="flex flex-col space-y-1">
          {sidebarLinks.map((link) => {
            const LinkIcon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative flex items-center gap-3.5 text-xs font-bold p-3 transition-colors ${
                  isActive
                    ? 'bg-rose-50/50 text-rose-700 font-black'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <LinkIcon className={`w-4.5 h-4.5 ${isActive ? 'text-rose-600' : 'text-slate-450'}`} />
                <span className="max-sm:hidden">{link.name}</span>
                {isActive && (
                  <span className="absolute bg-rose-650 right-0 top-1.5 bottom-1.5 w-1 rounded-l" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Return to shop */}
      <div className="px-4 pt-6 border-t border-slate-100 max-sm:hidden">
        <Link
          href="/"
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-150 border border-slate-205 text-slate-700 text-[11px] font-bold rounded-full transition-all cursor-pointer flex items-center justify-center space-x-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit to Storefront</span>
        </Link>
      </div>
    </div>
  );
}
