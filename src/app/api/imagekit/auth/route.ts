import { NextResponse } from "next/server";
import { imagekit } from "@/lib/imagekit";

// GET route to return ImageKit authentication parameters (signature, token, expire)
export async function GET() {
  try {
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
