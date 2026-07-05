"use server";

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { customCurrentUser as currentUser } from "@/lib/clerk-server";
import { inngest } from "@/lib/inngest/client";
import { isMockDb, isMockPayments } from "@/lib/env";
import { razorpay } from "@/lib/razorpay";
import {
  createOrderSchema,
  updateOrderStatusSchema,
  verifyRazorpayPaymentSchema,
  formatZodError,
} from "@/lib/validations";
import { checkRateLimit, ACTION_RATE_LIMIT } from "@/lib/rate-limit";
import { getVendorStoreForUser } from "@/app/actions/products";

const STATUS_STEPS = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"] as const;

interface OrderItemInput {
  productId: string;
  quantity: number;
  price: number;
}

interface CreateOrderInput {
  totalAmount: number;
  address: string;
  phone: string;
  paymentMethod?: "razorpay" | "cod";
  items: OrderItemInput[];
}

export async function createOrder(data: CreateOrderInput) {
  try {
    // Validate with Zod
    const parsed = createOrderSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false as const, error: formatZodError(parsed.error) };
    }

    // 1. Authenticate with Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false as const, error: "Authentication required to checkout" };
    }

    // Rate limit
    const rl = checkRateLimit(`order:${clerkUser.id}`, ACTION_RATE_LIMIT);
    if (!rl.allowed) {
      return { success: false as const, error: "Too many requests. Please try again shortly." };
    }

    const validData = parsed.data;
    const amountPaise = Math.round(validData.totalAmount * 100);

    if (isMockDb()) {
      console.info("[VendorHub] Database is in zero-config Mock Mode. Simulating checkout order insertion.");
      const orderNumber = `VNH-${Math.floor(100000 + Math.random() * 900000)}`;
      const netAmount = parseFloat((validData.totalAmount * 0.9).toFixed(2));

      if (validData.paymentMethod === "razorpay") {
        return {
          success: true as const,
          orderId: `mock_order_${Math.floor(100000 + Math.random() * 900000)}`,
          orderNumber,
          netAmount,
          requiresPayment: true as const,
          razorpayOrderId: `mock_rzp_order_${Math.floor(100000 + Math.random() * 900000)}`,
          razorpayKeyId: "mock_key_id",
          amountPaise,
          currency: "INR" as const,
          mockPayment: true as const,
        };
      }

      return {
        success: true as const,
        orderId: `mock_order_${Math.floor(100000 + Math.random() * 900000)}`,
        orderNumber,
        netAmount,
        requiresPayment: false as const,
      };
    }

    // 2. Fetch corresponding database user profile
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return { success: false as const, error: "User profile not found in marketplace database" };
    }

    // 3. Formulate order number and calculate net amount after platform commission deduction
    const orderNumber = `VNH-${Math.floor(100000 + Math.random() * 900000)}`;
    const netAmount = parseFloat((validData.totalAmount * 0.9).toFixed(2)); // Default 10% platform commission
    const gateway = validData.paymentMethod === "razorpay" ? "RAZORPAY" : "COD";

    // 4. Insert order + orderItems and reserve stock atomically. Reserving stock
    // at creation (rather than waiting for payment confirmation) avoids charging
    // a customer for an item that sells out in the meantime.
    let order;
    try {
      order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            orderNumber,
            totalAmount: validData.totalAmount,
            netAmount,
            address: validData.address,
            buyerId: user.id,
            paymentGateway: gateway,
            orderItems: {
              create: validData.items.map((item) => ({
                quantity: item.quantity,
                price: item.price,
                productId: item.productId,
              })),
            },
          },
          include: {
            orderItems: true,
          },
        });

        for (const item of validData.items) {
          const res = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });

          if (res.count === 0) {
            throw new Error("One of the items in your cart is out of stock");
          }
        }

        return created;
      });
    } catch (txError: unknown) {
      const message = txError instanceof Error ? txError.message : "Failed to process checkout on server";
      return { success: false as const, error: message };
    }

    // 5. Asynchronously trigger Inngest event for background inventory audits and notifications
    try {
      await inngest.send({
        name: "order/placed",
        data: {
          orderId: order.id,
        },
      });
    } catch (e) {
      console.error("Failed to send order/placed event to Inngest:", e);
    }

    // 6. For online payments, create the Razorpay order the client will pay against.
    if (validData.paymentMethod === "razorpay") {
      if (isMockPayments()) {
        // A real database order exists but Razorpay isn't configured server-side.
        // Faking a "paid" response here would clear the customer's cart while the
        // order silently stays PLACED/PENDING forever (never surfaced to vendors).
        // Release the stock reservation and reject instead of pretending to succeed.
        await prisma.$transaction(async (tx) => {
          for (const item of validData.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
          await tx.order.update({
            where: { id: order.id },
            data: { paymentStatus: "FAILED" },
          });
        });

        return {
          success: false as const,
          error: "Online payments are temporarily unavailable. Please choose Cash on Delivery.",
        };
      }

      try {
        const razorpayOrder = await razorpay.orders.create({
          amount: amountPaise,
          currency: "INR",
          receipt: order.orderNumber,
        });

        await prisma.order.update({
          where: { id: order.id },
          data: { razorpayOrderId: razorpayOrder.id },
        });

        return {
          success: true as const,
          orderId: order.id,
          orderNumber: order.orderNumber,
          netAmount: order.netAmount,
          requiresPayment: true as const,
          razorpayOrderId: razorpayOrder.id,
          razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
          amountPaise,
          currency: "INR" as const,
        };
      } catch (rzpError: unknown) {
        // Release the stock reservation since no real payment session exists for this order.
        await prisma.$transaction(async (tx) => {
          for (const item of validData.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
          await tx.order.update({
            where: { id: order.id },
            data: { paymentStatus: "FAILED" },
          });
        });

        const message = rzpError instanceof Error ? rzpError.message : "Failed to initialize payment gateway";
        return { success: false as const, error: message };
      }
    }

    return {
      success: true as const,
      orderId: order.id,
      orderNumber: order.orderNumber,
      netAmount: order.netAmount,
      requiresPayment: false as const,
    };

  } catch (error: any) {
    console.error("Server Action CreateOrder Error:", error);
    return { success: false as const, error: error.message || "Failed to process checkout on server" };
  }
}

export async function verifyRazorpayPayment(input: {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  try {
    const parsed = verifyRazorpayPaymentSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false as const, error: formatZodError(parsed.error) };
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false as const, error: "Authentication required" };
    }

    if (isMockDb() || isMockPayments()) {
      return { success: true as const, verified: true };
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

    // Recompute the HMAC the same way Razorpay does: sha256(order_id|payment_id) with the key secret.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (expectedSignature !== razorpaySignature) {
      return { success: false as const, error: "Payment signature verification failed" };
    }

    // Optimistic update for fast UX only — the webhook is the authoritative source
    // of truth and applies the same transition independently.
    await prisma.order.updateMany({
      where: { id: orderId, razorpayOrderId, paymentStatus: "PENDING" },
      data: {
        paymentStatus: "PAID",
        razorpayPaymentId,
        razorpaySignature,
        status: "CONFIRMED",
      },
    });

    return { success: true as const, verified: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to verify payment";
    return { success: false as const, error: message };
  }
}

export async function updateOrderStatus(orderId: string, status: "CONFIRMED" | "SHIPPED" | "DELIVERED") {
  try {
    const parsed = updateOrderStatusSchema.safeParse({ orderId, status });
    if (!parsed.success) {
      return { success: false as const, error: formatZodError(parsed.error) };
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false as const, error: "Authentication required" };
    }

    const rl = checkRateLimit(`vendor-order:${clerkUser.id}`, ACTION_RATE_LIMIT);
    if (!rl.allowed) {
      return { success: false as const, error: "Too many requests. Please try again shortly." };
    }

    if (isMockDb()) {
      return { success: true as const, order: { id: orderId, status } };
    }

    const vendor = await getVendorStoreForUser(clerkUser.id);
    if (!vendor) {
      return { success: false as const, error: "Vendor store not found" };
    }

    const owns = await prisma.orderItem.findFirst({
      where: { orderId, product: { storeId: vendor.store.id } },
      select: { id: true },
    });

    if (!owns) {
      return { success: false as const, error: "Order not found or you do not have permission to update it" };
    }

    const existing = await prisma.order.findUnique({
      where: { id: orderId },
      select: { status: true },
    });

    if (!existing) {
      return { success: false as const, error: "Order not found" };
    }

    const currentIndex = STATUS_STEPS.indexOf(existing.status as (typeof STATUS_STEPS)[number]);
    const targetIndex = STATUS_STEPS.indexOf(status);

    if (targetIndex <= currentIndex) {
      return { success: false as const, error: `Cannot move status backward from ${existing.status} to ${status}` };
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        buyer: { select: { name: true, email: true } },
        orderItems: {
          include: { product: { select: { id: true, name: true, images: true } } },
        },
      },
    });

    return { success: true as const, order };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update order status";
    return { success: false as const, error: message };
  }
}

export async function getVendorOrders() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false as const, error: "Authentication required", orders: [] };
    }

    if (isMockDb()) {
      return { success: true as const, orders: [] };
    }

    const vendor = await getVendorStoreForUser(clerkUser.id);
    if (!vendor) {
      return { success: false as const, error: "Vendor store not found", orders: [] };
    }

    const orders = await prisma.order.findMany({
      where: {
        orderItems: { some: { product: { storeId: vendor.store.id } } },
        OR: [
          { paymentGateway: "COD" },
          { paymentGateway: "RAZORPAY", paymentStatus: "PAID" },
        ],
      },
      include: {
        buyer: { select: { name: true, email: true } },
        orderItems: {
          where: { product: { storeId: vendor.store.id } },
          include: { product: { select: { id: true, name: true, images: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true as const, orders };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load vendor orders";
    return { success: false as const, error: message, orders: [] };
  }
}

export async function getMyOrders() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false as const, error: "Authentication required", orders: [] };
    }

    if (isMockDb()) {
      return { success: true as const, orders: [] };
    }

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) {
      return { success: false as const, error: "User profile not found", orders: [] };
    }

    const orders = await prisma.order.findMany({
      where: { buyerId: user.id },
      include: {
        orderItems: {
          include: {
            product: { select: { id: true, name: true, images: true, category: true } },
            review: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true as const, orders };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load your orders";
    return { success: false as const, error: message, orders: [] };
  }
}
