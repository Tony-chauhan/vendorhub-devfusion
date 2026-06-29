"use server";

import { prisma } from "@/lib/prisma";
import { customCurrentUser as currentUser } from "@/lib/clerk-server";
import { isMockDb, ADMIN_EMAIL } from "@/lib/env";
import { storeStatusSchema, processRefundSchema, formatZodError } from "@/lib/validations";
import { checkRateLimit, ACTION_RATE_LIMIT } from "@/lib/rate-limit";

// 1. Helper to assert that the caller is the platform administrator
export async function checkAdmin() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return false;

    if (isMockDb()) {
      const email = clerkUser.emailAddresses?.[0]?.emailAddress;
      return email === ADMIN_EMAIL;
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { role: true, email: true },
    });

    if (user?.role === "ADMIN") return true;

    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    return email === ADMIN_EMAIL;
  } catch {
    return false;
  }
}

// 2. Fetch all stores awaiting platform verification
export async function getPendingStores() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized access to admin portal" };
  }

  if (isMockDb()) {
    return { success: true, stores: [] };
  }

  try {
    const stores = await prisma.store.findMany({
      where: { status: "PENDING" },
      include: {
        vendor: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, stores };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 3. Approve or Reject a vendor store registration
export async function updateStoreStatus(storeId: string, status: "APPROVED" | "REJECTED") {
  // Validate inputs
  const parsed = storeStatusSchema.safeParse({ storeId, status });
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  if (isMockDb()) {
    return { success: true };
  }

  try {
    const store = await prisma.store.update({
      where: { id: parsed.data.storeId },
      data: { status: parsed.data.status },
    });
    return { success: true, store };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 4. Aggregate platform-wide sales and commission fees
export async function getAdminAnalytics() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  if (isMockDb()) {
    return {
      success: true,
      analytics: {
        totalSales: 23620,
        totalNet: 21258,
        platformCommission: 2362,
        activeVendors: 3,
        pendingVendors: 2
      }
    };
  }

  try {
    // Total aggregate sales
    const salesAggregate = await prisma.order.aggregate({
      _sum: { totalAmount: true },
    });
    const totalSales = salesAggregate._sum.totalAmount || 0;

    // Total payouts sent to vendors (netAmount)
    const netAggregate = await prisma.order.aggregate({
      _sum: { netAmount: true },
    });
    const totalNet = netAggregate._sum.netAmount || 0;

    // Platform commission earned (10% of total)
    const platformCommission = parseFloat((totalSales - totalNet).toFixed(2));

    // Active approved stores count
    const activeVendors = await prisma.store.count({
      where: { status: "APPROVED" },
    });

    // PENDING stores count
    const pendingVendors = await prisma.store.count({
      where: { status: "PENDING" },
    });

    return {
      success: true,
      analytics: {
        totalSales: parseFloat(totalSales.toFixed(2)),
        totalNet: parseFloat(totalNet.toFixed(2)),
        platformCommission,
        activeVendors,
        pendingVendors,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 5. Fetch all refund requests submitted by buyers
export async function getRefundRequests() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  if (isMockDb()) {
    return { success: true, refunds: [] };
  }

  try {
    const refunds = await prisma.refund.findMany({
      include: {
        order: {
          include: {
            buyer: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, refunds };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 6. Process (Approve/Reject) refund request ticket
export async function processRefund(refundId: string, status: "APPROVED" | "REJECTED") {
  // Validate inputs
  const parsed = processRefundSchema.safeParse({ refundId, status });
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized" };
  }

  if (isMockDb()) {
    return { success: true };
  }

  try {
    const refund = await prisma.refund.update({
      where: { id: parsed.data.refundId },
      data: { status: parsed.data.status },
    });
    return { success: true, refund };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
