'use client';

import React, { useState } from 'react';
import Title from './Title';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thank you for subscribing to VendorHub Plus updates!');
    setEmail('');
  };

  return (
    <div className="flex flex-col items-center px-4 my-20 sm:my-28 max-w-4xl mx-auto text-center">
      <Title
        title="Join Newsletter"
        description="Subscribe to get exclusive deals, new arrivals, and insider updates delivered straight to your inbox every week."
        visibleButton={false}
      />
      <form
        onSubmit={handleSubmit}
        className="flex bg-white shadow-sm hover:shadow-md transition-shadow text-xs sm:text-sm p-1.5 rounded-full w-full max-w-xl my-6 border border-slate-200"
      >
        <input
          className="flex-1 pl-5 pr-2 outline-none text-slate-800 placeholder:text-slate-400 font-medium"
          type="email"
          placeholder="Enter your professional email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          type="submit"
          className="inline-flex items-center space-x-1.5 font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-md shadow-indigo-600/10"
        >
          <span>Get Updates</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
