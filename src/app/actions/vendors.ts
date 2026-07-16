"use server";

import { prisma } from "@/lib/prisma";
import { customCurrentUser as currentUser, syncClerkRoleMetadata } from "@/lib/clerk-server";
import { isMockDb, resolveRole } from "@/lib/env";
import { registerVendorSchema, formatZodError } from "@/lib/validations";
import { checkRateLimit, ACTION_RATE_LIMIT } from "@/lib/rate-limit";
import { encryptSensitive } from "@/lib/crypto";
import { verifyGSTIN } from "@/lib/gst-verification";

interface RegisterVendorInput {
  name: string;
  description: string;
  logo: string;
  location: string;
  gstNumber?: string;
  panNumber: string;
  bankAccountNumber: string;
  bankIfsc: string;
}

export async function registerVendor(data: RegisterVendorInput) {
  try {
    // Validate with Zod
    const parsed = registerVendorSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: formatZodError(parsed.error) };
    }

    // 1. Authenticate with Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Authentication required to apply as a vendor" };
    }

    // Rate limit
    const rl = await checkRateLimit(`vendor-reg:${clerkUser.id}`, ACTION_RATE_LIMIT);
    if (!rl.allowed) {
      return { success: false, error: "Too many requests. Please try again shortly." };
    }

    const validData = parsed.data;

    if (isMockDb()) {
      console.info("[VendorHub] Database is in zero-config Mock Mode. Simulating store registration.");
      return {
        success: true,
        storeId: `mock_store_${Math.floor(100000 + Math.random() * 900000)}`,
        status: "APPROVED",
        storeName: validData.name,
      };
    }

    // 2. Fetch user profile
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return { success: false, error: "User profile not found in database. Please log in again." };
    }

    // Check if user already owns a store
    const existingStore = await prisma.store.findUnique({
      where: { vendorId: user.id },
    });

    if (existingStore) {
      return {
        success: false,
        error: `You have already registered a store named '${existingStore.name}'. Status: ${existingStore.status}`,
      };
    }

    // 3. GST verification (format-checked always; provider-checked when
    // GST_VERIFICATION_API_URL/_API_KEY are configured — see lib/gst-verification.ts).
    let verificationStatus: "UNVERIFIED" | "PENDING" | "VERIFIED" | "REJECTED" = "PENDING";
    let verificationNotes: string | null = null;
    if (validData.gstNumber) {
      const gstResult = await verifyGSTIN(validData.gstNumber);
      verificationStatus = gstResult.status;
      verificationNotes = gstResult.message;
    } else {
      verificationNotes = "No GSTIN provided (small-seller exemption) — PAN on file, pending manual review.";
    }

    // 4. Create Store in PENDING status
    const store = await prisma.store.create({
      data: {
        name: validData.name,
        description: validData.description,
        logo: validData.logo || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80",
        location: validData.location,
        status: "PENDING", // Always PENDING initially, requires ADMIN approval
        vendorId: user.id,
        gstNumber: validData.gstNumber || null,
        panNumber: validData.panNumber,
        bankAccountNumber: encryptSensitive(validData.bankAccountNumber),
        bankIfsc: validData.bankIfsc,
        verificationStatus,
        verificationNotes,
      },
    });

    // 5. Update database user role to VENDOR (grant dashboard visibility) and
    // mirror the role into Clerk metadata for the proxy fast-path.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: "VENDOR",
      },
    });
    await syncClerkRoleMetadata(clerkUser.id, "VENDOR");

    return {
      success: true,
      storeId: store.id,
      status: store.status,
      storeName: store.name,
    };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Server Action RegisterVendor Error:", error);
    return { success: false, error: error.message || "Failed to submit vendor application" };
  }
}

export async function getCurrentUserRoleAndStore() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Not authenticated", role: "BUYER" as const, store: null };
    }

    // Rate limit
    const rl = await checkRateLimit(`role-check:${clerkUser.id}`, ACTION_RATE_LIMIT);
    if (!rl.allowed) {
      return { success: false, error: "Too many requests", role: "BUYER" as const, store: null };
    }

    if (isMockDb()) {
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
      const name = clerkUser.fullName || `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
      return {
        success: true,
        role: resolveRole(email) as "BUYER" | "VENDOR" | "ADMIN",
        email,
        name,
        store: null,
      };
    }

    let user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { store: true },
    });

    if (!user) {
      // Sync user profile if not in DB yet
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
      const name = clerkUser.fullName || `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
      const role = resolveRole(email);

      user = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email,
          name,
          role,
        },
        include: { store: true },
      });
    }

    return {
      success: true,
      role: user.role as "BUYER" | "VENDOR" | "ADMIN",
      email: user.email,
      name: user.name,
      store: user.store,
    };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error in getCurrentUserRoleAndStore:", error);
    return { success: false, error: error.message || "Failed to fetch user role", role: "BUYER" as const, store: null };
  }
}
