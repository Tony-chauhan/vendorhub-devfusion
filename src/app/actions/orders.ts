"use server";

import { prisma } from "@/lib/prisma";
import { customCurrentUser as currentUser } from "@/lib/clerk-server";
import { inngest } from "@/lib/inngest/client";
import { isMockDb } from "@/lib/env";
import { createOrderSchema, formatZodError } from "@/lib/validations";
import { checkRateLimit, ACTION_RATE_LIMIT } from "@/lib/rate-limit";

interface OrderItemInput {
  productId: string;
  quantity: number;
  price: number;
}

interface CreateOrderInput {
  totalAmount: number;
  address: string;
  items: OrderItemInput[];
}

export async function createOrder(data: CreateOrderInput) {
  try {
    // Validate with Zod
    const parsed = createOrderSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: formatZodError(parsed.error) };
    }

    // 1. Authenticate with Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Authentication required to checkout" };
    }

    // Rate limit
    const rl = checkRateLimit(`order:${clerkUser.id}`, ACTION_RATE_LIMIT);
    if (!rl.allowed) {
      return { success: false, error: "Too many requests. Please try again shortly." };
    }

    const validData = parsed.data;

    if (isMockDb()) {
      console.info("[VendorHub] Database is in zero-config Mock Mode. Simulating checkout order insertion.");
      const orderNumber = `VNH-${Math.floor(100000 + Math.random() * 900000)}`;
      return {
        success: true,
        orderId: `mock_order_${Math.floor(100000 + Math.random() * 900000)}`,
        orderNumber,
        netAmount: parseFloat((validData.totalAmount * 0.9).toFixed(2))
      };
    }

    // 2. Fetch corresponding database user profile
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return { success: false, error: "User profile not found in marketplace database" };
    }

    // 3. Formulate order number and calculate net amount after platform commission deduction
    const orderNumber = `VNH-${Math.floor(100000 + Math.random() * 900000)}`;
    const netAmount = parseFloat((validData.totalAmount * 0.9).toFixed(2)); // Default 10% platform commission

    // 4. Insert order and orderItems within a transaction
    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount: validData.totalAmount,
        netAmount,
        address: validData.address,
        buyerId: user.id,
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

    // 5. Decrement stock levels in the database for each item purchased
    for (const item of validData.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // 6. Asynchronously trigger Inngest event for background inventory audits and notifications
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

    return { 
      success: true, 
      orderId: order.id, 
      orderNumber: order.orderNumber, 
      netAmount: order.netAmount 
    };

  } catch (error: any) {
    console.error("Server Action CreateOrder Error:", error);
    return { success: false, error: error.message || "Failed to process checkout on server" };
  }
}
