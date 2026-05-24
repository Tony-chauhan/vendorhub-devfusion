"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

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
