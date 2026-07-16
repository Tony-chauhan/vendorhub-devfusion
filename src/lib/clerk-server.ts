import * as ClerkServer from "@clerk/nextjs/server";

export const IS_MOCK_AUTH = false;

/**
 * 👤 Safe currentUser server helper - delegated directly to real Clerk
 */
export async function customCurrentUser() {
  return await ClerkServer.currentUser();
}

/**
 * 🔒 Safe auth server helper - delegated directly to real Clerk
 */
export async function customAuth() {
  return await ClerkServer.auth();
}

/**
 * Syncs a user's authoritative DB role into Clerk's publicMetadata so
 * proxy.ts can do a fast edge-level allow/redirect from `sessionClaims`
 * without a DB round-trip.
 */
export async function syncClerkRoleMetadata(
  clerkId: string,
  role: "BUYER" | "VENDOR" | "ADMIN"
): Promise<void> {
  try {
    const client = await ClerkServer.clerkClient();
    await client.users.updateUserMetadata(clerkId, {
      publicMetadata: { role },
    });
  } catch (error) {
    console.error("[clerk] Failed to sync role metadata for", clerkId, error);
  }
}

/**
 * 🔒 Safe clerkMiddleware helper - delegated directly to real Clerk
 */
export function customClerkMiddleware(callback?: any) {
  return ClerkServer.clerkMiddleware(callback);
}
