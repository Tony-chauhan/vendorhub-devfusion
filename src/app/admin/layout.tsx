import React from 'react';
import type { Metadata } from 'next';
import AdminLayout from '@/components/admin/AdminLayout';

export const metadata: Metadata = {
  title: 'Moderator Dashboard | VendorHub Global Console',
  description: 'Moderate physical stores, coupon codes, and approve store applications.',
};

export default function RootAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
