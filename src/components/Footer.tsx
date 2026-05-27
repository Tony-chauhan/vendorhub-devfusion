'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

// Custom inline SVG components for social media brand icons to prevent Lucide version breakages
const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14.9987 1.66699H12.4987C11.3936 1.66699 10.3338 2.10598 9.55242 2.88738C8.77102 3.66878 8.33203 4.72859 8.33203 5.83366V8.33366H5.83203V11.667H8.33203V18.3337H11.6654V11.667H14.1654L14.9987 8.33366H11.6654V5.83366C11.6654 5.61265 11.7532 5.40068 11.9094 5.2444C12.0657 5.08812 12.2777 5.00033 12.4987 5.00033H14.9987V1.66699Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M14.5846 5.41699H14.593M5.83464 1.66699H14.168C16.4692 1.66699 18.3346 3.53247 18.3346 5.83366V14.167C18.3346 16.4682 16.4692 18.3337 14.168 18.3337H5.83464C3.53345 18.3337 1.66797 16.4682 1.66797 14.167V5.83366C1.66797 3.53247 3.53345 1.66699 5.83464 1.66699ZM13.3346 9.47533C13.4375 10.1689 13.319 10.8772 12.9961 11.4995C12.6732 12.1218 12.1623 12.6265 11.536 12.9417C10.9097 13.2569 10.2 13.3667 9.50779 13.2553C8.81557 13.1439 8.1761 12.8171 7.68033 12.3213C7.18457 11.8255 6.85775 11.1861 6.74636 10.4938C6.63497 9.80162 6.74469 9.0919 7.05991 8.46564C7.37512 7.83937 7.87979 7.32844 8.50212 7.00553C9.12445 6.68261 9.83276 6.56415 10.5263 6.66699C11.2337 6.7719 11.8887 7.10154 12.3944 7.60725C12.9001 8.11295 13.2297 8.76789 13.3346 9.47533Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M18.3346 3.33368C18.3346 3.33368 17.7513 5.08368 16.668 6.16701C18.0013 14.5003 8.83464 20.5837 1.66797 15.8337C3.5013 15.917 5.33464 15.3337 6.66797 14.167C2.5013 12.917 0.417969 8.00034 2.5013 4.16701C4.33464 6.33368 7.16797 7.58368 10.0013 7.50034C9.2513 4.00034 13.3346 2.00034 15.8346 4.33368C16.7513 4.33368 18.3346 3.33368 18.3346 3.33368Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LinkedinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13.3346 6.66699C14.6607 6.66699 15.9325 7.19378 16.8702 8.13146C17.8079 9.06914 18.3346 10.3409 18.3346 11.667V17.5003H15.0013V11.667C15.0013 11.225 14.8257 10.801 14.5131 10.4885C14.2006 10.1759 13.7767 10.0003 13.3346 10.0003C12.8926 10.0003 12.4687 10.1759 12.1561 10.4885C11.8436 10.801 11.668 11.225 11.668 11.667V17.5003H8.33464V11.667C8.33464 10.3409 8.86142 9.06914 9.7991 8.13146C10.7368 7.19378 12.0086 6.66699 13.3346 6.66699Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.0013 7.50033H1.66797V17.5003H5.0013V7.50033Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.33464 5.00033C4.25511 5.00033 5.0013 4.25413 5.0013 3.33366C5.0013 2.41318 4.25511 1.66699 3.33464 1.66699C2.41416 1.66699 1.66797 2.41318 1.66797 3.33366C1.66797 4.25413 2.41416 5.00033 3.33464 5.00033Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default function Footer() {
  const linkSections = [
    {
      title: "Marketplace",
      links: [
        { text: "Earphones", path: "/shop?category=Earbuds" },
        { text: "Headphones", path: "/shop?category=Headphones" },
        { text: "Smartphones", path: "/shop?category=Mobile" },
        { text: "Laptops", path: "/shop?category=Laptop" },
      ]
    },
    {
      title: "Solutions",
      links: [
        { text: "Home Storefront", path: "/" },
        { text: "Privacy Policy", path: "#" },
        { text: "Plus Premium Pricing", path: "/pricing" },
        { text: "Onboard Your Store", path: "/create-store" },
      ]
    },
    {
      title: "Contact",
      links: [
        { text: "+1-212-456-7890", path: "tel:+12124567890", icon: Phone },
        { text: "support@vendorhub.plus", path: "mailto:support@vendorhub.plus", icon: Mail },
        { text: "794 Francisco St, San Francisco, CA", path: "#", icon: MapPin }
      ]
    }
  ];

  return (
    <footer className="w-full bg-white border-t border-slate-200/80 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 pb-12 border-b border-slate-100">
          {/* Logo & Intro Section */}
          <div className="md:col-span-5 flex flex-col space-y-4">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                Vendor<span className="text-indigo-600">Hub</span>
                <span className="text-indigo-600 font-black">.</span>
              </span>
              <span className="ml-2 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-indigo-650 bg-indigo-50 border border-indigo-150 rounded">
                plus
              </span>
            </Link>
            <p className="text-slate-500 text-xs sm:text-sm max-w-sm leading-relaxed">
              Your ultimate hyper-local marketplace. Onboard your physical store, list your inventory, and shop for premium electronic items with high-performance delivery, smart couponing, and curated Gemini recommendations.
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 rounded-full text-slate-400 hover:text-indigo-600 hover:scale-105 transition-all"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 rounded-full text-slate-400 hover:text-indigo-600 hover:scale-105 transition-all"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 rounded-full text-slate-400 hover:text-indigo-600 hover:scale-105 transition-all"
              >
                <TwitterIcon />
              </a>
              <a
                href="https://www.linkedin.com/in/dharmender-chauhan-3aaru52402"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 rounded-full text-slate-400 hover:text-indigo-600 hover:scale-105 transition-all"
              >
                <LinkedinIcon />
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {linkSections.map((section, idx) => (
              <div key={idx} className="flex flex-col space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  {section.title}
                </h4>
                <ul className="flex flex-col space-y-2.5">
                  {section.links.map((link, linkIdx) => {
                    const Icon = (link as any).icon;
                    return (
                      <li key={linkIdx}>
                        <Link
                          href={link.path}
                          className="flex items-center text-xs text-slate-500 hover:text-indigo-600 transition-colors group"
                        >
                          {Icon && <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 mr-2" />}
                          <span>{link.text}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Lower Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-[11px] text-slate-400">
          <p>© 2026 VendorHub Plus. Created with ❤️ under white glassmorphic aesthetic guidelines. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link href="#" className="hover:text-slate-650">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-650">Terms of Use</Link>
            <Link href="#" className="hover:text-slate-650">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
