"use server";

import { prisma } from "@/lib/prisma";
import { customCurrentUser as currentUser } from "@/lib/clerk-server";
import { isMockDb, resolveRole } from "@/lib/env";
import { toggleWishlistSchema, formatZodError } from "@/lib/validations";
import { checkRateLimit, ACTION_RATE_LIMIT } from "@/lib/rate-limit";

export async function toggleWishlist(productId: string) {
  try {
    const parsed = toggleWishlistSchema.safeParse({ productId });
    if (!parsed.success) {
      return { success: false as const, error: formatZodError(parsed.error) };
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false as const, error: "Authentication required" };
    }

    const rl = await checkRateLimit(`wishlist:${clerkUser.id}`, ACTION_RATE_LIMIT);
    if (!rl.allowed) {
      return { success: false as const, error: "Too many requests. Please try again shortly." };
    }

    if (isMockDb()) {
      return { success: true as const, wishlisted: true };
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
      user = await prisma.user.upsert({
        where: { email },
        update: {
          clerkId: clerkUser.id,
          name,
        },
        create: {
          clerkId: clerkUser.id,
          email,
          name,
          role: resolveRole(email),
        },
        select: { id: true },
      });
    }

    const existing = await prisma.user.findFirst({
      where: { id: user.id, wishlist: { some: { id: parsed.data.productId } } },
      select: { id: true },
    });

    if (existing) {
      await prisma.user.update({
        where: { id: user.id },
        data: { wishlist: { disconnect: { id: parsed.data.productId } } },
      });
      return { success: true as const, wishlisted: false };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { wishlist: { connect: { id: parsed.data.productId } } },
    });

    return { success: true as const, wishlisted: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "Failed to update wishlist";
    return { success: false as const, error: message };
  }
}

export async function getWishlistedProductIds() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false as const, error: "Authentication required", productIds: [] as string[] };
    }

    if (isMockDb()) {
      return { success: true as const, productIds: [] as string[] };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { wishlist: { select: { id: true } } },
    });

    if (!user) {
      const email = clerkUser.emailAddresses?.[0]?.emailAddress;
      if (!email) {
        return { success: false as const, error: "No email address found on account", productIds: [] as string[] };
      }
      const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null;
      await prisma.user.upsert({
        where: { email },
        update: {
          clerkId: clerkUser.id,
          name,
        },
        create: {
          clerkId: clerkUser.id,
          email,
          name,
          role: resolveRole(email),
        },
      });
      return { success: true as const, productIds: [] };
    }

    return { success: true as const, productIds: user.wishlist.map((p) => p.id) };
  } catch (error: unknown) {
    const message = error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "Failed to load wishlist";
    return { success: false as const, error: message, productIds: [] as string[] };
  }
}
