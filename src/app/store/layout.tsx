import React from 'react';
import type { Metadata } from 'next';
import StoreLayout from '@/components/store/StoreLayout';

export const metadata: Metadata = {
  title: 'Merchant Dashboard | VendorHub Plus',
  description: 'Manage products, inventory levels, and check customer orders.',
};

export default function RootStoreLayout({ children }: { children: React.ReactNode }) {
  return <StoreLayout>{children}</StoreLayout>;
}
