"use server";

import { prisma } from "@/lib/prisma";
import { customCurrentUser as currentUser } from "@/lib/clerk-server";

interface RegisterVendorInput {
  name: string;
  description: string;
  logo: string;
  location: string;
}

export async function registerVendor(data: RegisterVendorInput) {
  try {
    // 1. Authenticate with Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return { success: false, error: "Authentication required to apply as a vendor" };
    }

    const dbUrl = process.env.DATABASE_URL;
    const isMockDb = !dbUrl || dbUrl.includes("mock") || dbUrl.includes("mockpassword") || dbUrl.includes("ep-mock-host");

    if (isMockDb) {
      console.info("[VendorHub] Database is in zero-config Mock Mode. Simulating store registration.");
      return { 
        success: true, 
        storeId: `mock_store_${Math.floor(100000 + Math.random() * 900000)}`, 
        status: "APPROVED",
        storeName: data.name 
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
        error: `You have already registered a store named '${existingStore.name}'. Status: ${existingStore.status}` 
      };
    }

    // 3. Create Store in PENDING status
    const store = await prisma.store.create({
      data: {
        name: data.name,
        description: data.description,
        logo: data.logo || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=150&auto=format&fit=crop&q=80",
        location: data.location,
        status: "PENDING", // Always PENDING initially, requires ADMIN approval
        vendorId: user.id,
      },
    });

    // 4. Update database user role to VENDOR (grant dashboard visibility)
    await prisma.user.update({
      where: { id: user.id },
      data: {
        role: "VENDOR",
      },
    });

    return { 
      success: true, 
      storeId: store.id, 
      status: store.status,
      storeName: store.name 
    };

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

    const dbUrl = process.env.DATABASE_URL;
    const isMockDb = !dbUrl || dbUrl.includes("mock") || dbUrl.includes("mockpassword") || dbUrl.includes("ep-mock-host");

    if (isMockDb) {
      const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
      const name = clerkUser.fullName || `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim();
      const isAdmin = email === "dharmenderchauhan802@gmail.com";
      return {
        success: true,
        role: (isAdmin ? "ADMIN" : "BUYER") as "BUYER" | "VENDOR" | "ADMIN",
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
      const role = email === "dharmenderchauhan802@gmail.com" ? "ADMIN" : "BUYER";

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
  } catch (error: any) {
    console.error("Error in getCurrentUserRoleAndStore:", error);
    return { success: false, error: error.message || "Failed to fetch user role", role: "BUYER" as const, store: null };
  }
}

