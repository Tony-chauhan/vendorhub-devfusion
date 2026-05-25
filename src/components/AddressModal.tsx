'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { addAddress } from '@/lib/features/address/addressSlice';

interface AddressModalProps {
  onClose: () => void;
}

export default function AddressModal({ onClose }: AddressModalProps) {
  const dispatch = useDispatch();
  const [address, setAddress] = useState({
    name: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
  });

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const savePromise = new Promise((resolve) => {
      setTimeout(() => {
        dispatch(
          addAddress({
            ...address,
            id: `addr_${Date.now()}`,
            createdAt: new Date().toString(),
          })
        );
        resolve(true);
      }, 800);
    });

    toast.promise(savePromise, {
      loading: 'Saving new address...',
      success: () => {
        onClose();
        return 'Shipping address saved successfully!';
      },
      error: 'Failed to save address.',
    });
  };

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/40 backdrop-blur-sm h-screen w-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl w-full max-w-sm relative mx-4 animate-in fade-in zoom-in-95 duration-200 space-y-4"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <h2 className="text-lg font-extrabold text-slate-800">Add Shipping Address</h2>
        <p className="text-xs text-slate-400 font-semibold mb-2">
          Provide your destination coordinates for local vendor dispatches
        </p>

        <div className="space-y-3.5">
          <input
            name="name"
            onChange={handleAddressChange}
            value={address.name}
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all font-medium placeholder:text-slate-400"
            type="text"
            placeholder="Full Recipient Name"
            required
          />

          <input
            name="email"
            onChange={handleAddressChange}
            value={address.email}
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all font-medium placeholder:text-slate-400"
            type="email"
            placeholder="Email Address"
            required
          />

          <input
            name="street"
            onChange={handleAddressChange}
            value={address.street}
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all font-medium placeholder:text-slate-400"
            type="text"
            placeholder="Street Address, Apt, Suite"
            required
          />

          <div className="flex gap-3.5">
            <input
              name="city"
              onChange={handleAddressChange}
              value={address.city}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all font-medium placeholder:text-slate-400"
              type="text"
              placeholder="City"
              required
            />
            <input
              name="state"
              onChange={handleAddressChange}
              value={address.state}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all font-medium placeholder:text-slate-400"
              type="text"
              placeholder="State"
              required
            />
          </div>

          <div className="flex gap-3.5">
            <input
              name="zip"
              onChange={handleAddressChange}
              value={address.zip}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all font-medium placeholder:text-slate-400"
              type="text"
              placeholder="Zip Code"
              required
            />
            <input
              name="country"
              onChange={handleAddressChange}
              value={address.country}
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all font-medium placeholder:text-slate-400"
              type="text"
              placeholder="Country"
              required
            />
          </div>

          <input
            name="phone"
            onChange={handleAddressChange}
            value={address.phone}
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 transition-all font-medium placeholder:text-slate-400"
            type="text"
            placeholder="Contact Phone Number"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-3.5 font-bold text-white bg-indigo-600 hover:bg-indigo-700 text-xs rounded-full shadow-md shadow-indigo-600/10 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
        >
          Save Shipping Destination
        </button>
      </form>
    </div>
  );
}
