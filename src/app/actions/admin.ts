"use server";

import { prisma } from "@/lib/prisma";
import { customCurrentUser as currentUser, syncClerkRoleMetadata } from "@/lib/clerk-server";
import { isMockDb, ADMIN_EMAIL } from "@/lib/env";
import {
  storeStatusSchema,
  processRefundSchema,
  setUserRoleSchema,
  verifyStoreSchema,
  processPayoutSchema,
  formatZodError,
} from "@/lib/validations";

import { logAdminAction } from "@/lib/audit-log";
import { decryptSensitive, maskAccountNumber } from "@/lib/crypto";
import { sendEmail, vendorApprovalEmail, refundDecisionEmail } from "@/lib/notifications/email";
import { calculateAndCreatePayout } from "@/lib/payouts";

// ─── Authorization ──────────────────────────────────────────────

/**
 * Whether the current caller is an admin. DB `role` is the sole source of
 * truth in real-DB mode — no email-based bypass. (Mock-DB mode has no DB to
 * check against, so it falls back to matching ADMIN_EMAIL, same as the
 * bootstrap role resolver in lib/env.ts.)
 */
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
      select: { role: true },
    });

    return user?.role === "ADMIN";
  } catch {
    return false;
  }
}

/**
 * Resolves the admin's own DB user id (for audit-log attribution) alongside
 * the boolean check, so callers don't need a second round-trip.
 */
async function getAdminIdentity(): Promise<{ dbUserId: string; clerkId: string } | null> {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    if (isMockDb()) {
      const email = clerkUser.emailAddresses?.[0]?.emailAddress;
      if (email !== ADMIN_EMAIL) return null;
      return { dbUserId: "mock_admin_id", clerkId: clerkUser.id };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { id: true, role: true },
    });

    if (user?.role !== "ADMIN") return null;
    return { dbUserId: user.id, clerkId: clerkUser.id };
  } catch {
    return null;
  }
}

function safeMaskBankAccount(encrypted: string | null): string | null {
  if (!encrypted) return null;
  try {
    return maskAccountNumber(decryptSensitive(encrypted));
  } catch {
    return "•••• (unavailable — check BANK_DETAILS_ENCRYPTION_KEY)";
  }
}

// ─── Store approval queue ───────────────────────────────────────

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

    const withMaskedBank = stores.map((s) => ({
      ...s,
      bankAccountNumber: safeMaskBankAccount(s.bankAccountNumber),
    }));

    return { success: true, stores: withMaskedBank };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllStores() {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized access to admin portal", stores: [] };
  }

  if (isMockDb()) {
    return { success: true, stores: [] };
  }

  try {
    const stores = await prisma.store.findMany({
      include: { vendor: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });

    const withMaskedBank = stores.map((s) => ({
      ...s,
      bankAccountNumber: safeMaskBankAccount(s.bankAccountNumber),
    }));

    return { success: true, stores: withMaskedBank };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, error: error.message, stores: [] };
  }
}

// Approve or Reject a vendor store registration
export async function updateStoreStatus(storeId: string, status: "APPROVED" | "REJECTED") {
  const parsed = storeStatusSchema.safeParse({ storeId, status });
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const admin = await getAdminIdentity();
  if (!admin) {
    return { success: false, error: "Unauthorized" };
  }

  if (isMockDb()) {
    return { success: true };
  }

  try {
    const store = await prisma.store.update({
      where: { id: parsed.data.storeId },
      data: { status: parsed.data.status },
      include: { vendor: { select: { email: true } } },
    });

    await logAdminAction({
      adminUserId: admin.dbUserId,
      action: `STORE_${parsed.data.status}`,
      targetType: "Store",
      targetId: store.id,
    });

    if (store.vendor?.email) {
      const { subject, html } = vendorApprovalEmail({
        storeName: store.name,
        approved: parsed.data.status === "APPROVED",
      });
      await sendEmail({ to: store.vendor.email, subject, html });
    }

    return { success: true, store };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Admin decision on vendor GST/PAN verification (distinct from store
// approval — a store can be APPROVED and operating while verification is
// still PENDING manual review).
export async function verifyVendorStore(storeId: string, verificationStatus: "VERIFIED" | "REJECTED", notes?: string) {
  const parsed = verifyStoreSchema.safeParse({ storeId, verificationStatus, notes });
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const admin = await getAdminIdentity();
  if (!admin) {
    return { success: false, error: "Unauthorized" };
  }

  if (isMockDb()) {
    return { success: true };
  }

  try {
    const store = await prisma.store.update({
      where: { id: parsed.data.storeId },
      data: {
        verificationStatus: parsed.data.verificationStatus,
        verificationNotes: parsed.data.notes || null,
      },
    });

    await logAdminAction({
      adminUserId: admin.dbUserId,
      action: `STORE_VERIFICATION_${parsed.data.verificationStatus}`,
      targetType: "Store",
      targetId: store.id,
      metadata: { notes: parsed.data.notes },
    });

    return { success: true, store };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Platform analytics ─────────────────────────────────────────

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
        pendingVendors: 2,
        totalOrders: 42,
        totalProducts: 86,
        totalUsers: 120,
      },
      recentOrders: [] as Array<{ createdAt: string; total: number }>,
      recentOrdersList: [] as Array<{ id: string; orderNumber: string; buyerName: string; totalAmount: number; status: string; createdAt: string }>,
      topVendors: [] as Array<{ storeName: string; revenue: number; orderCount: number }>,
    };
  }

  try {
    const [salesAggregate, netAggregate, activeVendors, pendingVendors, totalOrders, totalProducts, totalUsers] = await Promise.all([
      prisma.order.aggregate({ _sum: { totalAmount: true } }),
      prisma.order.aggregate({ _sum: { netAmount: true } }),
      prisma.store.count({ where: { status: "APPROVED" } }),
      prisma.store.count({ where: { status: "PENDING" } }),
      prisma.order.count(),
      prisma.product.count(),
      prisma.user.count(),
    ]);

    const totalSales = salesAggregate._sum.totalAmount || 0;
    const totalNet = netAggregate._sum.netAmount || 0;
    const platformCommission = parseFloat((totalSales - totalNet).toFixed(2));

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrdersRaw = await prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, totalAmount: true },
      orderBy: { createdAt: "asc" },
    });
    const recentOrders = recentOrdersRaw.map((o) => ({
      createdAt: o.createdAt.toISOString(),
      total: o.totalAmount,
    }));

    // Recent orders list for dashboard table (last 10)
    const recentOrdersListRaw = await prisma.order.findMany({
      select: {
        id: true,
        orderNumber: true,
        totalAmount: true,
        status: true,
        createdAt: true,
        buyer: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    const recentOrdersList = recentOrdersListRaw.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      buyerName: o.buyer?.name || "Unknown",
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    }));

    // Top 5 vendors by revenue
    const storesWithRevenue = await prisma.store.findMany({
      where: { status: "APPROVED" },
      select: {
        name: true,
        products: {
          select: {
            orderItems: {
              select: { price: true, quantity: true, orderId: true },
            },
          },
        },
      },
    });

    const topVendors = storesWithRevenue
      .map((store) => {
        let revenue = 0;
        const orderIds = new Set<string>();
        for (const product of store.products) {
          for (const oi of product.orderItems) {
            revenue += oi.price * oi.quantity;
            orderIds.add(oi.orderId);
          }
        }
        return { storeName: store.name, revenue: parseFloat(revenue.toFixed(2)), orderCount: orderIds.size };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      success: true,
      recentOrders,
      recentOrdersList,
      topVendors,
      analytics: {
        totalSales: parseFloat(totalSales.toFixed(2)),
        totalNet: parseFloat(totalNet.toFixed(2)),
        platformCommission,
        activeVendors,
        pendingVendors,
        totalOrders,
        totalProducts,
        totalUsers,
      },
    };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Refunds ────────────────────────────────────────────────────

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function processRefund(refundId: string, status: "APPROVED" | "REJECTED") {
  const parsed = processRefundSchema.safeParse({ refundId, status });
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const admin = await getAdminIdentity();
  if (!admin) {
    return { success: false, error: "Unauthorized" };
  }

  if (isMockDb()) {
    return { success: true };
  }

  try {
    const refund = await prisma.refund.update({
      where: { id: parsed.data.refundId },
      data: { status: parsed.data.status },
      include: { order: { include: { buyer: { select: { email: true } } } } },
    });

    await logAdminAction({
      adminUserId: admin.dbUserId,
      action: `REFUND_${parsed.data.status}`,
      targetType: "Refund",
      targetId: refund.id,
      metadata: { orderId: refund.orderId },
    });

    if (refund.order.buyer?.email) {
      const { subject, html } = refundDecisionEmail({
        orderNumber: refund.order.orderNumber,
        approved: parsed.data.status === "APPROVED",
      });
      await sendEmail({ to: refund.order.buyer.email, subject, html });
    }

    return { success: true, refund };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Role management ────────────────────────────────────────────

export async function setUserRole(userId: string, role: "BUYER" | "VENDOR" | "ADMIN") {
  const parsed = setUserRoleSchema.safeParse({ userId, role });
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const admin = await getAdminIdentity();
  if (!admin) {
    return { success: false, error: "Unauthorized" };
  }

  if (isMockDb()) {
    return { success: true };
  }

  try {
    const user = await prisma.user.update({
      where: { id: parsed.data.userId },
      data: { role: parsed.data.role },
    });

    await syncClerkRoleMetadata(user.clerkId, parsed.data.role);

    await logAdminAction({
      adminUserId: admin.dbUserId,
      action: "ROLE_CHANGE",
      targetType: "User",
      targetId: user.id,
      metadata: { newRole: parsed.data.role },
    });

    return { success: true, user };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Audit log ──────────────────────────────────────────────────

export async function getAuditLog(page: number = 1, limit: number = 50) {
  const isAdmin = await checkAdmin();
  if (!isAdmin) {
    return { success: false, error: "Unauthorized", entries: [], total: 0, pageCount: 0 };
  }

  if (isMockDb()) {
    return { success: true, entries: [], total: 0, pageCount: 1 };
  }

  try {
    const [total, entries] = await Promise.all([
      prisma.adminAuditLog.count(),
      prisma.adminAuditLog.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return { success: true, entries, total, pageCount: Math.max(1, Math.ceil(total / limit)) };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, error: error.message, entries: [], total: 0, pageCount: 0 };
  }
}

// ─── Vendor payouts ─────────────────────────────────────────────

export async function processVendorPayout(storeId: string) {
  const parsed = processPayoutSchema.safeParse({ storeId });
  if (!parsed.success) {
    return { success: false, error: formatZodError(parsed.error) };
  }

  const admin = await getAdminIdentity();
  if (!admin) {
    return { success: false, error: "Unauthorized" };
  }

  if (isMockDb()) {
    return { success: true, payout: { id: "mock_payout", amount: 0 }, pendingManualTransfer: true };
  }

  try {
    const result = await calculateAndCreatePayout(parsed.data.storeId);
    if (!result.success || !result.payout) {
      return { success: false, error: result.error || "Failed to process payout" };
    }

    await logAdminAction({
      adminUserId: admin.dbUserId,
      action: "PAYOUT_PROCESS",
      targetType: "Payout",
      targetId: result.payout.id,
      metadata: {
        storeId: parsed.data.storeId,
        amount: result.payout.amount,
        pendingManualTransfer: result.pendingManualTransfer,
      },
    });

    return { success: true, payout: result.payout, pendingManualTransfer: result.pendingManualTransfer };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
