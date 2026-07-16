"use client";

import React from "react";
import * as Clerk from "@clerk/nextjs";

export const IS_MOCK_AUTH = false;

/**
 * 🔒 Failsafe Clerk Provider - delegated directly to real Clerk.
 */
export function CustomClerkProvider({ children }: { children: React.ReactNode }) {
  return <Clerk.ClerkProvider>{children}</Clerk.ClerkProvider>;
}

/**
 * 👤 Custom useUser hook - delegated directly to real Clerk.
 */
export function useCustomUser() {
  return Clerk.useUser();
}

/**
 * 🚪 Custom Sign Out Button - delegated directly to real Clerk.
 */
export function CustomSignOutButton({ children }: { children: React.ReactNode }) {
  return <Clerk.SignOutButton>{children}</Clerk.SignOutButton>;
}

/**
 * 🔑 Custom Sign In Button - delegated directly to real Clerk.
 */
export function CustomSignInButton({ children }: { children: React.ReactNode }) {
  return <Clerk.SignInButton mode="modal">{children}</Clerk.SignInButton>;
}

/**
 * ✨ Custom Sign Up Button - delegated directly to real Clerk.
 */
export function CustomSignUpButton({ children }: { children: React.ReactNode }) {
  return <Clerk.SignUpButton mode="modal">{children}</Clerk.SignUpButton>;
}
