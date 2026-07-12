import { inngest } from "./client";
import { prisma } from "../prisma";
import { resolveRole } from "../env";
import { syncClerkRoleMetadata } from "../clerk-server";
import { sendEmail, lowStockAlertEmail } from "../notifications/email";
import { calculateAndCreatePayout } from "../payouts";

// 1. Sync User Creation from Clerk Webhook
export const clerkUserCreated = inngest.createFunction(
  { 
    id: "sync-clerk-user-created",
    triggers: [{ event: "clerk/user.created" }]
  },
  async ({ event, step }) => {
    const { id, email_addresses, first_name, last_name, public_metadata } = event.data;
    const email = email_addresses?.[0]?.email_address;
    const name = `${first_name || ""} ${last_name || ""}`.trim();
    const registrationIntent = public_metadata?.registrationIntent as string | undefined;

    if (!email) return { status: "ignored", reason: "No email address found" };

    // Auto-promote admin emails. VENDOR role is granted only after store registration.
    const role = resolveRole(email);

    const user = await step.run("create-user-in-db", async () => {
      return await prisma.user.upsert({
        where: { clerkId: id },
        update: {
          email,
          name,
        },
        create: {
          clerkId: id,
          email,
          name,
          role,
        },
      });
    });

    await step.run("sync-clerk-role-metadata", async () => {
      await syncClerkRoleMetadata(id, user.role as "BUYER" | "VENDOR" | "ADMIN");
    });

    return {
      status: "success",
      userId: user.id,
      role: user.role,
      registrationIntent: registrationIntent ?? "BUYER",
    };
  }
);

// 2. Sync User Updates from Clerk Webhook
export const clerkUserUpdated = inngest.createFunction(
  { 
    id: "sync-clerk-user-updated",
    triggers: [{ event: "clerk/user.updated" }]
  },
  async ({ event, step }) => {
    const { id, email_addresses, first_name, last_name } = event.data;
    const email = email_addresses?.[0]?.email_address;
    const name = `${first_name || ""} ${last_name || ""}`.trim();

    if (!email) return { status: "ignored", reason: "No email address found" };

    const user = await step.run("update-user-in-db", async () => {
      return await prisma.user.update({
        where: { clerkId: id },
        data: {
          email,
          name,
        },
      });
    });

    return { status: "success", userId: user.id };
  }
);

// 3. Sync User Deletions from Clerk Webhook
export const clerkUserDeleted = inngest.createFunction(
  { 
    id: "sync-clerk-user-deleted",
    triggers: [{ event: "clerk/user.deleted" }]
  },
  async ({ event, step }) => {
    const { id } = event.data;

    await step.run("delete-user-from-db", async () => {
      return await prisma.user.deleteMany({
        where: { clerkId: id },
      });
    });

    return { status: "success", deletedClerkId: id };
  }
);

// 4. Low-stock inventory monitoring background job triggered after checkout purchases
export const checkLowStock = inngest.createFunction(
  { 
    id: "check-low-stock",
    triggers: [{ event: "order/placed" }]
  },
  async ({ event, step }) => {
    const { orderId } = event.data;

    // Fetch order line-items from database
    const orderItems = await step.run("fetch-order-items", async () => {
      return await prisma.orderItem.findMany({
        where: { orderId },
        include: {
          product: {
            include: {
              store: { include: { vendor: { select: { email: true } } } },
            },
          },
        },
      });
    });

    const alerts: Array<{
      productId: string;
      productName: string;
      currentStock: number;
      storeId: string;
      storeName: string;
      vendorEmail: string | null;
    }> = [];

    // Analyze inventory thresholds
    for (const item of orderItems) {
      if (item.product.stock <= 3) {
        alerts.push({
          productId: item.productId,
          productName: item.product.name,
          currentStock: item.product.stock,
          storeId: item.product.storeId,
          storeName: item.product.store.name,
          vendorEmail: item.product.store.vendor?.email ?? null,
        });
      }
    }

    // One email per affected vendor, covering every low-stock product from this order.
    if (alerts.length > 0) {
      await step.run("send-low-stock-alert", async () => {
        const byStore = new Map<string, { storeName: string; vendorEmail: string | null; items: typeof alerts }>();
        for (const alert of alerts) {
          const entry = byStore.get(alert.storeId) ?? { storeName: alert.storeName, vendorEmail: alert.vendorEmail, items: [] };
          entry.items.push(alert);
          byStore.set(alert.storeId, entry);
        }

        for (const { storeName, vendorEmail, items } of byStore.values()) {
          if (!vendorEmail) continue;
          const { subject, html } = lowStockAlertEmail({
            storeName,
            alerts: items.map((i) => ({ productName: i.productName, currentStock: i.currentStock })),
          });
          await sendEmail({ to: vendorEmail, subject, html });
        }

        return { alerted: true, alerts };
      });
    }

    return { status: "processed", alertsTriggeredCount: alerts.length, alerts };
  }
);

// 5. Weekly automated vendor payout scheduling. Calculates and records each
// approved store's outstanding balance since its last payout (see
// lib/payouts.ts) — real fund transfer additionally happens when
// RAZORPAY_X_ACCOUNT_NUMBER is configured, otherwise the payout is recorded
// pending manual bank transfer.
export const scheduledPayouts = inngest.createFunction(
  {
    id: "scheduled-vendor-payouts",
    triggers: [{ cron: "0 3 * * 1" }], // Every Monday 03:00 server time
  },
  async ({ step }) => {
    const stores = await step.run("fetch-approved-stores", async () => {
      return await prisma.store.findMany({
        where: { status: "APPROVED" },
        select: { id: true, name: true },
      });
    });

    const results: Array<{ storeId: string; storeName: string; amount?: number; error?: string }> = [];

    for (const store of stores) {
      const result = await step.run(`payout-${store.id}`, async () => calculateAndCreatePayout(store.id));

      results.push({
        storeId: store.id,
        storeName: store.name,
        amount: result.payout?.amount,
        error: result.success ? undefined : result.error,
      });
    }

    const paidCount = results.filter((r) => r.amount !== undefined).length;
    return { status: "processed", storesChecked: stores.length, payoutsCreated: paidCount, results };
  }
);
