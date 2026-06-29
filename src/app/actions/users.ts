"use server";

import { prisma } from "@/lib/prisma";
import { customCurrentUser as currentUser, IS_MOCK_AUTH } from "@/lib/clerk-server";
import { isMockDb, resolveRole } from "@/lib/env";
import { updateProfileSchema, formatZodError } from "@/lib/validations";
import { checkRateLimit, ACTION_RATE_LIMIT } from "@/lib/rate-limit";

export type UserRole = "BUYER" | "VENDOR" | "ADMIN";
export type RegistrationIntent = "BUYER" | "VENDOR";

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
  store: {
    id: string;
    name: string;
    status: string;
    location: string;
  } | null;
}

function buildMockProfile(clerkUser: NonNullable<Awaited<ReturnType<typeof currentUser>>>): UserProfile {
  const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
  return {
    id: "mock_user_id",
    email,
    name: (clerkUser.fullName ?? `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim()) || null,
    role: resolveRole(email),
    createdAt: new Date().toISOString(),
    store: null,
  };
}

export async function getCurrentUserProfile(): Promise<
  { success: true; profile: UserProfile } | { success: false; error: string }
> {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Authentication required" };
    }

    // Rate limit by clerk user ID
    const rl = checkRateLimit(`profile:${clerkUser.id}`, ACTION_RATE_LIMIT);
    if (!rl.allowed) {
      return { success: false, error: "Too many requests. Please try again shortly." };
    }

    if (IS_MOCK_AUTH || isMockDb()) {
      return { success: true, profile: buildMockProfile(clerkUser) };
    }

    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: {
        store: {
          select: { id: true, name: true, status: true, location: true },
        },
      },
    });

    if (!user) {
      const email = clerkUser.emailAddresses?.[0]?.emailAddress;
      if (!email) {
        return { success: false, error: "No email address found on account" };
      }

      const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null;
      user = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email,
          name,
          role: resolveRole(email),
        },
        include: {
          store: {
            select: { id: true, name: true, status: true, location: true },
          },
        },
      });
    }

    return {
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        store: user.store,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load profile";
    return { success: false, error: message };
  }
}

export async function updateUserProfile(data: { name: string }): Promise<
  { success: true; profile: UserProfile } | { success: false; error: string }
> {
  try {
    // Validate input with Zod
    const parsed = updateProfileSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: formatZodError(parsed.error) };
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Authentication required" };
    }

    // Rate limit
    const rl = checkRateLimit(`update:${clerkUser.id}`, ACTION_RATE_LIMIT);
    if (!rl.allowed) {
      return { success: false, error: "Too many requests. Please try again shortly." };
    }

    const { name } = parsed.data;

    if (IS_MOCK_AUTH || isMockDb()) {
      const profile = buildMockProfile(clerkUser);
      profile.name = name;
      return { success: true, profile };
    }

    const user = await prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: { name },
      include: {
        store: {
          select: { id: true, name: true, status: true, location: true },
        },
      },
    });

    return {
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        store: user.store,
      },
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return { success: false, error: message };
  }
}

export async function completeRegistration(intent: RegistrationIntent): Promise<
  { success: true; redirectTo: string } | { success: false; error: string }
> {
  const profileResult = await getCurrentUserProfile();
  if (!profileResult.success) {
    return { success: false, error: profileResult.error };
  }

  const redirectTo = intent === "VENDOR" ? "/vendor/register" : "/";
  return { success: true, redirectTo };
}

export async function checkVendorAccess(): Promise<
  { success: true; isVendor: boolean; store: UserProfile["store"] } | { success: false; error: string }
> {
  const profileResult = await getCurrentUserProfile();
  if (!profileResult.success) {
    return { success: false, error: profileResult.error };
  }

  const { profile } = profileResult;
  const isVendor = profile.role === "VENDOR" && profile.store !== null;

  return { success: true, isVendor, store: profile.store };
}
