'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Home, PlusCircle, CheckSquare, ListOrdered, ArrowLeft } from 'lucide-react';

interface StoreSidebarProps {
  storeInfo: {
    name: string;
    logo: any;
  } | null;
}

export default function StoreSidebar({ storeInfo }: StoreSidebarProps) {
  const pathname = usePathname();

  const sidebarLinks = [
    { name: 'Dashboard', href: '/store', icon: Home },
    { name: 'Add Product', href: '/store/add-product', icon: PlusCircle },
    { name: 'Manage Products', href: '/store/manage-product', icon: CheckSquare },
    { name: 'Customer Orders', href: '/store/orders', icon: ListOrdered },
  ];

  return (
    <div className="inline-flex h-full flex-col justify-between border-r border-slate-200/80 bg-white sm:min-w-64 z-10 py-6">
      <div className="flex flex-col space-y-6">
        {/* Merchant Store Header */}
        <div className="flex flex-col gap-3 justify-center items-center px-4 max-sm:hidden">
          <div className="relative w-14 h-14 bg-slate-50 border border-slate-200/60 rounded-full flex items-center justify-center overflow-hidden shadow-sm">
            {storeInfo?.logo ? (
              <Image
                src={storeInfo.logo}
                alt={storeInfo.name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="font-extrabold text-slate-400">GS</span>
            )}
          </div>
          <p className="text-slate-800 font-extrabold text-sm text-center">
            {storeInfo?.name || 'S-mart'}
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
                    ? 'bg-indigo-50/50 text-indigo-700 font-black'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <LinkIcon className={`w-4.5 h-4.5 ${isActive ? 'text-indigo-600' : 'text-slate-450'}`} />
                <span className="max-sm:hidden">{link.name}</span>
                {isActive && (
                  <span className="absolute bg-indigo-650 right-0 top-1.5 bottom-1.5 w-1 rounded-l" />
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
