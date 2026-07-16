"use server";

import { prisma } from "@/lib/prisma";
import { customCurrentUser as currentUser } from "@/lib/clerk-server";
import { isMockDb, resolveRole } from "@/lib/env";
import { syncCartSchema, formatZodError } from "@/lib/validations";
import { checkRateLimit, ACTION_RATE_LIMIT } from "@/lib/rate-limit";

/**
 * Cart Persistence Server Actions
 *
 * Phase 1 implementation: syncs the client-side Redux cart state to the
 * database so it survives page reloads and device switches.
 *
 * Uses a lightweight key-value approach (JSON column) on the User model
 * rather than a separate CartItem table, keeping the schema change minimal
 * while delivering full persistence.
 *
 * For Phase 2 the cart can be promoted to a first-class relational model
 * with stock reservation and expiration logic.
 */

// ─── Save Cart ──────────────────────────────────────────────────
export async function saveCart(items: Record<string, number>) {
  try {
    // Validate
    const parsed = syncCartSchema.safeParse({ items });
    if (!parsed.success) {
      return { success: false, error: formatZodError(parsed.error) };
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Authentication required" };
    }

    // Rate limit
    const rl = await checkRateLimit(`cart-save:${clerkUser.id}`, ACTION_RATE_LIMIT);
    if (!rl.allowed) {
      return { success: false, error: "Too many requests. Please try again shortly." };
    }

    if (isMockDb()) {
      // In mock mode, cart persistence is handled client-side via localStorage
      return { success: true, source: "mock" };
    }

    const email = clerkUser.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      return { success: false, error: "No email address found on account" };
    }
    const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null;

    // Persist cart as JSON in a dedicated field, automatically creating the user if missing.
    await prisma.user.upsert({
      where: { clerkId: clerkUser.id },
      update: {
        cartData: JSON.stringify(parsed.data.items),
      },
      create: {
        clerkId: clerkUser.id,
        email,
        name,
        role: resolveRole(email),
        cartData: JSON.stringify(parsed.data.items),
      },
    });

    return { success: true, source: "database" };
  } catch (error: unknown) {
    const message = error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "Failed to save cart";
    console.error("saveCart error:", message);
    return { success: false, error: message };
  }
}

// ─── Load Cart ──────────────────────────────────────────────────
export async function loadCart(): Promise<
  { success: true; items: Record<string, number> } | { success: false; error: string }
> {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Authentication required" };
    }

    // Rate limit
    const rl = await checkRateLimit(`cart-load:${clerkUser.id}`, ACTION_RATE_LIMIT);
    if (!rl.allowed) {
      return { success: false, error: "Too many requests" };
    }

    if (isMockDb()) {
      return { success: true, items: {} };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: { cartData: true },
    });

    if (!user || !user.cartData) {
      return { success: true, items: {} };
    }

    const items = JSON.parse(user.cartData) as Record<string, number>;
    return { success: true, items };
  } catch (error: unknown) {
    const message = error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "Failed to load cart";
    console.error("loadCart error:", message);
    return { success: false, error: message };
  }
}

// ─── Clear Cart ─────────────────────────────────────────────────
export async function clearServerCart() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Authentication required" };
    }

    if (isMockDb()) {
      return { success: true };
    }

    await prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: { cartData: null },
    });

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "Failed to clear cart";
    return { success: false, error: message };
  }
}
