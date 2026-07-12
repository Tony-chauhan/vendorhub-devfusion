import { forbidden } from 'next/navigation';
import { getAdminAnalytics } from '@/app/actions/admin';
import AdminDashboardClient from '@/components/admin/AdminDashboardClient';

export default async function AdminDashboardPage() {
  const result = await getAdminAnalytics();
  if (!result.success || !result.analytics) {
    forbidden();
  }

  return (
    <AdminDashboardClient
      analytics={result.analytics}
      recentOrders={result.recentOrders ?? []}
      recentOrdersList={result.recentOrdersList ?? []}
      topVendors={result.topVendors ?? []}
    />
  );
}
