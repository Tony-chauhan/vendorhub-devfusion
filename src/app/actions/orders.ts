"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

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
    // 1. Authenticate with Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Authentication required to checkout" };
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
    const netAmount = parseFloat((data.totalAmount * 0.9).toFixed(2)); // Default 10% platform commission

    // 4. Insert order and orderItems within a transaction
    const order = await prisma.order.create({
      data: {
        orderNumber,
        totalAmount: data.totalAmount,
        netAmount,
        address: data.address,
        buyerId: user.id,
        orderItems: {
          create: data.items.map((item) => ({
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
    for (const item of data.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
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
