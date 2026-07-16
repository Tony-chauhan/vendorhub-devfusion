"use server";

import { prisma } from "@/lib/prisma";
import { customCurrentUser as currentUser } from "@/lib/clerk-server";
import { isMockDb, resolveRole } from "@/lib/env";
import { createReviewSchema, formatZodError } from "@/lib/validations";
import { checkRateLimit, ACTION_RATE_LIMIT } from "@/lib/rate-limit";

export async function createReview(input: { productId: string; rating: number; comment: string }) {
  try {
    const parsed = createReviewSchema.safeParse(input);
    if (!parsed.success) {
      return { success: false as const, error: formatZodError(parsed.error) };
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false as const, error: "Authentication required" };
    }

    const rl = await checkRateLimit(`review:${clerkUser.id}`, ACTION_RATE_LIMIT);
    if (!rl.allowed) {
      return { success: false as const, error: "Too many requests. Please try again shortly." };
    }

    const { productId, rating, comment } = parsed.data;

    if (isMockDb()) {
      return {
        success: true as const,
        review: {
          id: `mock_review_${Math.floor(100000 + Math.random() * 900000)}`,
          rating,
          comment,
          productId,
          createdAt: new Date().toISOString(),
        },
      };
    }

    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { id: true },
    });

    if (!user) {
      const email = clerkUser.emailAddresses?.[0]?.emailAddress;
      if (!email) {
        return { success: false as const, error: "No email address found on account" };
      }
      const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null;
      user = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email,
          name,
          role: resolveRole(email),
        },
        select: { id: true },
      });
    }

    // Verified-purchase check: the buyer must have a delivered order item for
    // this product that hasn't been reviewed yet.
    const deliveredItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: { buyerId: user.id, status: "DELIVERED" },
        review: null,
      },
      orderBy: { order: { createdAt: "desc" } },
    });

    if (!deliveredItem) {
      return { success: false as const, error: "You can only review products from delivered orders" };
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        buyerId: user.id,
        productId,
        orderItemId: deliveredItem.id,
      },
    });

    return { success: true as const, review };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && (error as { code: unknown }).code === "P2002") {
      return { success: false as const, error: "You have already reviewed this product" };
    }
    const message = error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "Failed to submit review";
    return { success: false as const, error: message };
  }
}

export async function getProductReviews(productId: string) {
  try {
    if (!productId || typeof productId !== "string") {
      return { success: false as const, error: "Invalid product ID", reviews: [] as const };
    }

    if (isMockDb()) {
      return { success: true as const, reviews: [] };
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { buyer: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return { success: true as const, reviews };
  } catch (error: unknown) {
    const message = error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "Failed to load reviews";
    return { success: false as const, error: message, reviews: [] };
  }
}
