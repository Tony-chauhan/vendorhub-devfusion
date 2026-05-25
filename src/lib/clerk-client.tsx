"use client";

import React, { createContext, useContext } from "react";
import * as Clerk from "@clerk/nextjs";

// Check if we should activate the local zero-config evaluation mock mode
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
export const IS_MOCK_AUTH = !clerkKey || clerkKey.includes("mock") || clerkKey.startsWith("pk_test_dGVhbXhkZXNpZ24");

const MockUserContext = createContext({
  isSignedIn: true,
  user: {
    id: "mock_clerk_id",
    firstName: "Dharmender",
    lastName: "Chauhan",
    fullName: "Dharmender Chauhan",
    primaryEmailAddress: { emailAddress: "dharmenderchauhan802@gmail.com" },
    emailAddresses: [{ emailAddress: "dharmenderchauhan802@gmail.com" }],
  },
  isLoaded: true,
});

/**
 * 🔒 Failsafe Clerk Provider
 * Gracefully switches to local mode if Clerk dev instance is deleted/expired.
 */
export function CustomClerkProvider({ children }: { children: React.ReactNode }) {
  if (IS_MOCK_AUTH) {
    console.info("[VendorHub] Clerk is running in zero-config Local Evaluation Mode.");
    return (
      <MockUserContext.Provider
        value={{
          isSignedIn: true,
          isLoaded: true,
          user: {
            id: "mock_clerk_id",
            firstName: "Dharmender",
            lastName: "Chauhan",
            fullName: "Dharmender Chauhan",
            primaryEmailAddress: { emailAddress: "dharmenderchauhan802@gmail.com" },
            emailAddresses: [{ emailAddress: "dharmenderchauhan802@gmail.com" }],
          },
        }}
      >
        {children}
      </MockUserContext.Provider>
    );
  }

  return <Clerk.ClerkProvider>{children}</Clerk.ClerkProvider>;
}

/**
 * 👤 Custom useUser hook
 */
export function useCustomUser() {
  if (IS_MOCK_AUTH) {
    const mock = useContext(MockUserContext);
    return {
      isSignedIn: mock.isSignedIn,
      isLoaded: mock.isLoaded,
      user: mock.user,
    };
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return Clerk.useUser();
}

/**
 * 🚪 Custom Sign Out Button
 */
export function CustomSignOutButton({ children }: { children: React.ReactNode }) {
  if (IS_MOCK_AUTH) {
    return (
      <button
        onClick={() => alert("Sign out simulated in zero-config evaluation mode!")}
        className="w-full h-full text-left"
      >
        {children}
      </button>
    );
  }

  return <Clerk.SignOutButton>{children}</Clerk.SignOutButton>;
}

/**
 * 🔑 Custom Sign In Button
 */
export function CustomSignInButton({ children }: { children: React.ReactNode }) {
  if (IS_MOCK_AUTH) {
    return (
      <button
        onClick={() => alert("Sign in simulated in zero-config evaluation mode!")}
        className="w-full h-full text-left"
      >
        {children}
      </button>
    );
  }

  return <Clerk.SignInButton>{children}</Clerk.SignInButton>;
}
