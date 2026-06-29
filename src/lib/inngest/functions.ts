import { inngest } from "./client";
import { prisma } from "../prisma";
import { resolveRole } from "../env";

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
              store: true,
            },
          },
        },
      });
    });

    const alerts: Array<{
      productId: string;
      productName: string;
      currentStock: number;
      storeName: string;
    }> = [];

    // Analyze inventory thresholds
    for (const item of orderItems) {
      if (item.product.stock <= 3) {
        alerts.push({
          productId: item.productId,
          productName: item.product.name,
          currentStock: item.product.stock,
          storeName: item.product.store.name,
        });
      }
    }

    // Simulate sending low stock notification alerts to vendors
    if (alerts.length > 0) {
      await step.run("trigger-low-stock-alert", async () => {
        console.warn(`[Inngest Background Alert] Low stock detected for order ${orderId}:`, alerts);
        return { alerted: true, alerts };
      });
    }

    return { status: "processed", alertsTriggeredCount: alerts.length, alerts };
  }
);
