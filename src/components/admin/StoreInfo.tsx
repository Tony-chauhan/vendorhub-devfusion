'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin, Mail, Phone, Calendar, User } from 'lucide-react';

interface StoreInfoProps {
  store: {
    id: string;
    name: string;
    description: string;
    username: string;
    address: string;
    logo: string | null;
    email: string;
    contact: string;
    createdAt: string;
    status: string;
    user: {
      name: string;
      email: string;
      image: string | null;
    };
  };
}

export default function StoreInfo({ store }: StoreInfoProps) {
  const isApproved = store.status.toLowerCase() === 'approved';
  const isRejected = store.status.toLowerCase() === 'rejected';

  return (
    <div className="flex-grow flex flex-col sm:flex-row gap-6 text-xs text-slate-500 font-semibold leading-relaxed">
      {/* Brand Logo Grid */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 border border-slate-200/60 rounded-3xl flex items-center justify-center shrink-0 overflow-hidden relative shadow-sm">
        {store.logo ? (
          <Image
            src={store.logo}
            alt={store.name}
            fill
            className="object-cover"
          />
        ) : (
          <span className="font-extrabold text-slate-400">GS</span>
        )}
      </div>

      <div className="space-y-4 flex-grow">
        {/* Title row */}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-850">
              {store.name}
            </h3>
            <span className="text-[10px] text-slate-400">@{store.username}</span>

            <span
              className={`px-3 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border ${
                isApproved
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                  : isRejected
                  ? 'text-rose-700 bg-rose-50 border-rose-100'
                  : 'text-amber-700 bg-amber-50 border-amber-100'
              }`}
            >
              {store.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-normal max-w-xl font-medium pt-0.5">
            {store.description}
          </p>
        </div>

        {/* Contact info list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 border-t border-slate-100 pt-4 text-slate-500 font-medium">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="truncate max-w-[240px]">{store.address}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{store.contact}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{store.email}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Registered: {new Date(store.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-150/60 flex items-center space-x-3.5 max-w-sm">
          <div className="w-8 h-8 rounded-full bg-white border border-slate-205 overflow-hidden relative">
            {store.user?.image ? (
              <Image
                src={store.user.image}
                alt={store.user.name}
                width={32}
                height={32}
                className="object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-slate-400 mx-auto mt-1.5" />
            )}
          </div>
          <div className="space-y-0.5 text-[10px]">
            <p className="font-extrabold text-slate-700 leading-none">
              Onboarded by: {store.user?.name}
            </p>
            <p className="text-slate-400 font-bold leading-none pt-0.5">
              {store.user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
