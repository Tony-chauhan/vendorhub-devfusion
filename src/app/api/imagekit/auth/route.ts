import { NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";
import { checkRateLimit, API_RATE_LIMIT } from "@/lib/rate-limit";
import { headers } from "next/headers";

// GET route to return ImageKit authentication parameters (signature, token, expire)
export async function GET() {
  try {
    // Rate limit by IP
    const headerPayload = await headers();
    const clientIp = headerPayload.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    const rl = checkRateLimit(`imagekit:${clientIp}`, API_RATE_LIMIT);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    const authParams = imagekit.getAuthenticationParameters();
    return NextResponse.json(authParams);
  } catch (error) {
    console.error("ImageKit Auth Error:", error);
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 }
    );
  }
}
