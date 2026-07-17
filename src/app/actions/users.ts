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
  const metadataRole = clerkUser.publicMetadata?.role as string;
  const intentRole = clerkUser.unsafeMetadata?.registrationIntent as string;
  
  let role = resolveRole(email) as UserRole;
  if (metadataRole === "VENDOR" || metadataRole === "ADMIN") {
    role = metadataRole as UserRole;
  } else if (role === "BUYER" && intentRole === "VENDOR") {
    role = "VENDOR";
  }

  return {
    id: clerkUser.id,
    email,
    name: (clerkUser.fullName ?? `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim()) || null,
    role,
    createdAt: new Date().toISOString(),
    store: role === "VENDOR" ? {
      id: "mock_store_123",
      name: "Mock Vendor Store",
      status: "APPROVED",
      location: "Mock City"
    } : null,
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
    const rl = await checkRateLimit(`profile:${clerkUser.id}`, ACTION_RATE_LIMIT);
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
      let initialRole: "BUYER" | "VENDOR" | "ADMIN" = resolveRole(email);
      const intentRole = clerkUser.unsafeMetadata?.registrationIntent as string;
      if (initialRole === "BUYER" && intentRole === "VENDOR") {
        initialRole = "VENDOR";
      }

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
          role: initialRole,
        },
        include: {
          store: {
            select: { id: true, name: true, status: true, location: true },
          },
        },
      });

      if (user.role === "VENDOR" && !user.store) {
        // Auto-create store for demo purposes so they get full access immediately
        const store = await prisma.store.create({
          data: {
            name: `${name || "New Vendor"}'s Store`,
            description: "A new store on VendorHub",
            logo: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80",
            location: "Bangalore",
            status: "APPROVED",
            vendorId: user.id,
            panNumber: "ABCDE1234F",
            bankAccountNumber: "U2FsdGVkX19dummydata", // dummy encrypted data
            bankIfsc: "HDFC0001234",
            verificationStatus: "VERIFIED",
          }
        });
        
        user.store = {
          id: store.id,
          name: store.name,
          status: store.status,
          location: store.location
        };
      }
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
    const message = error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "Failed to load profile";
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
    const rl = await checkRateLimit(`update:${clerkUser.id}`, ACTION_RATE_LIMIT);
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
    const message = error instanceof Error ? (error instanceof Error ? error.message : String(error)) : "Failed to update profile";
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

  const redirectTo = intent === "VENDOR" ? "/store" : "/";
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
