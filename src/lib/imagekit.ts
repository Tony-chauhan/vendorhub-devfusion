import ImageKit from "imagekit";

// Initialize server-side ImageKit client singleton
// Provide fallback mock keys during build/evaluation time to prevent crash
export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "mock_public_key",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "mock_private_key",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/mock/",
});
