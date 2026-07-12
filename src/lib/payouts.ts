import { prisma } from "@/lib/prisma";
import { sendEmail, payoutProcessedEmail } from "@/lib/notifications/email";

export interface PayoutResult {
  success: boolean;
  error?: string;
  payout?: { id: string; amount: number };
  pendingManualTransfer?: boolean;
}

/**
 * Calculates the outstanding balance owed to a store since its last payout
 * (every DELIVERED order created since then, this store's proportional
 * share of each order's netAmount — a cart can span multiple vendors), and
 * records a Payout row for it. No auth check here: callers (the admin
 * action and the weekly Inngest cron) are each responsible for their own
 * authorization context.
 *
 * Real fund transfer via RazorpayX's Payouts API would be triggered here
 * when RAZORPAY_X_ACCOUNT_NUMBER is configured; without it, the payout is
 * still calculated and recorded, just left for manual bank transfer.
 */
export async function calculateAndCreatePayout(storeId: string): Promise<PayoutResult> {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { vendor: { select: { email: true } } },
  });
  if (!store) {
    return { success: false, error: "Store not found" };
  }

  const lastPayout = await prisma.payout.findFirst({
    where: { storeId: store.id },
    orderBy: { createdAt: "desc" },
  });

  const orders = await prisma.order.findMany({
    where: {
      status: "DELIVERED",
      ...(lastPayout ? { createdAt: { gt: lastPayout.createdAt } } : {}),
      orderItems: { some: { product: { storeId: store.id } } },
    },
    include: { orderItems: { include: { product: { select: { storeId: true } } } } },
  });

  let owed = 0;
  for (const order of orders) {
    const storeItemsTotal = order.orderItems
      .filter((oi) => oi.product.storeId === store.id)
      .reduce((sum, oi) => sum + oi.price * oi.quantity, 0);
    const orderTotal = order.orderItems.reduce((sum, oi) => sum + oi.price * oi.quantity, 0);
    if (orderTotal > 0) {
      owed += (storeItemsTotal / orderTotal) * order.netAmount;
    }
  }
  owed = parseFloat(owed.toFixed(2));

  if (owed <= 0) {
    return { success: false, error: "No outstanding balance to pay out for this store" };
  }

  const payout = await prisma.payout.create({
    data: { storeId: store.id, amount: owed },
  });

  const pendingManualTransfer = !process.env.RAZORPAY_X_ACCOUNT_NUMBER;

  if (store.vendor?.email) {
    const { subject, html } = payoutProcessedEmail({
      storeName: store.name,
      amount: owed,
      pendingManualTransfer,
    });
    await sendEmail({ to: store.vendor.email, subject, html });
  }

  return { success: true, payout: { id: payout.id, amount: payout.amount }, pendingManualTransfer };
}
