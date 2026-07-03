import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { customClerkMiddleware } from "@/lib/clerk-server";

const clerkSecretKey = process.env.CLERK_SECRET_KEY;
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isMock = !clerkSecretKey || clerkSecretKey.includes("mock") || !clerkPubKey || clerkPubKey.includes("mock") || clerkPubKey.startsWith("pk_test_dGVhbXhkZXNpZ24");

// Define matchers for routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/vendor(.*)",
  "/cart(.*)",
  "/checkout(.*)",
  "/profile(.*)",
]);

export default customClerkMiddleware(async (auth: any, req: any) => {
  if (isMock) return;
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
