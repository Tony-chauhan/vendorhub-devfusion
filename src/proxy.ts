import { createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { customClerkMiddleware } from "@/lib/clerk-server";

// Define matchers for routes that require authentication
const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/vendor(.*)",
  "/store(.*)",
  "/cart(.*)",
  "/checkout(.*)",
  "/profile(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
// Deliberately excludes /vendor(.*): that's the application/registration
// flow, which a plain BUYER must be able to reach precisely because they
// aren't a VENDOR yet. Only the post-approval operational area is role-gated.
const isVendorAreaRoute = createRouteMatcher(["/store(.*)"]);

export default customClerkMiddleware(async (auth: any, req: any) => {
  if (!isProtectedRoute(req)) return;

  await auth.protect();

  // Fast edge-level role gate using the `metadata.role` session-token custom
  // claim (requires a Clerk Dashboard session token customization exposing
  // `metadata: "{{user.public_metadata}}"` — see SETUP.md; without it this
  // claim is simply absent and every signed-in user falls through to the
  // page). This is a UX optimization only — it can 404/redirect obviously
  // wrong roles a step earlier, but every server action re-checks the DB
  // role independently and IS the real authorization boundary. Proxy
  // coverage can silently stop applying to a given route on a matcher
  // change, so nothing here should be treated as the sole guard.
  const { sessionClaims } = await auth();
  const role = (sessionClaims as any)?.metadata?.role as string | undefined;

  if (role) {
    if (isAdminRoute(req) && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
    if (isVendorAreaRoute(req) && role !== "VENDOR" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/forbidden", req.url));
    }
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
