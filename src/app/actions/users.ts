"use server";

import { prisma } from "@/lib/prisma";
import { customCurrentUser as currentUser, IS_MOCK_AUTH } from "@/lib/clerk-server";

const ADMIN_EMAIL = "dharmenderchauhan802@gmail.com";

function isMockDb() {
  const dbUrl = process.env.DATABASE_URL;
  return !dbUrl || dbUrl.includes("mock") || dbUrl.includes("mockpassword") || dbUrl.includes("ep-mock-host");
}

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

function resolveAdminRole(email: string): UserRole {
  return email === ADMIN_EMAIL ? "ADMIN" : "BUYER";
}

function buildMockProfile(clerkUser: NonNullable<Awaited<ReturnType<typeof currentUser>>>): UserProfile {
  const email = clerkUser.emailAddresses?.[0]?.emailAddress ?? "";
  return {
    id: "mock_user_id",
    email,
    name: clerkUser.fullName ?? `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || null,
    role: resolveAdminRole(email),
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
          role: resolveAdminRole(email),
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
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Authentication required" };
    }

    const trimmedName = data.name.trim();
    if (!trimmedName) {
      return { success: false, error: "Name cannot be empty" };
    }

    if (IS_MOCK_AUTH || isMockDb()) {
      const profile = buildMockProfile(clerkUser);
      profile.name = trimmedName;
      return { success: true, profile };
    }

    const user = await prisma.user.update({
      where: { clerkId: clerkUser.id },
      data: { name: trimmedName },
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
