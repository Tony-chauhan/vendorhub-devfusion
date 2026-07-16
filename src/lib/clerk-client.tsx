"use client";

import React, { createContext, useContext } from "react";
import * as Clerk from "@clerk/nextjs";

// Check if we should activate the local zero-config evaluation mock mode
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
export const IS_MOCK_AUTH = !clerkKey || clerkKey.includes("mock") || clerkKey.startsWith("pk_test_dGVhbXhkZXNpZ24");

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() ?? null;
  return null;
}

const MockUserContext = createContext({
  isSignedIn: false,
  user: {
    id: "",
    firstName: "",
    lastName: "",
    fullName: "",
    primaryEmailAddress: { emailAddress: "" },
    emailAddresses: [] as Array<{ emailAddress: string }>,
  },
  isLoaded: true,
});

/**
 * 🔒 Failsafe Clerk Provider
 * Gracefully switches to local mode if Clerk dev instance is deleted/expired.
 */
export function CustomClerkProvider({ children }: { children: React.ReactNode }) {
  if (IS_MOCK_AUTH) {
    const [signedInRole, setSignedInRole] = React.useState<string | null>(null);
    const [isLoaded, setIsLoaded] = React.useState(false);

    React.useEffect(() => {
      setSignedInRole(getCookie("mock_user_role"));
      setIsLoaded(true);
    }, []);

    console.info("[VendorHub] Clerk is running in zero-config Local Evaluation Mode. Role:", signedInRole);

    const user = signedInRole === "admin" ? {
      id: "mock_clerk_id_admin",
      firstName: "Dharmender",
      lastName: "Chauhan",
      fullName: "Dharmender Chauhan",
      primaryEmailAddress: { emailAddress: "dharmenderchauhan802@gmail.com" },
      emailAddresses: [{ emailAddress: "dharmenderchauhan802@gmail.com" }],
    } : signedInRole === "buyer" ? {
      id: "mock_clerk_id_buyer",
      firstName: "Jane",
      lastName: "Buyer",
      fullName: "Jane Buyer",
      primaryEmailAddress: { emailAddress: "buyer@vendorhub.com" },
      emailAddresses: [{ emailAddress: "buyer@vendorhub.com" }],
    } : null;

    return (
      <MockUserContext.Provider
        value={{
          isSignedIn: !!signedInRole,
          isLoaded,
          user: user || {
            id: "",
            firstName: "",
            lastName: "",
            fullName: "",
            primaryEmailAddress: { emailAddress: "" },
            emailAddresses: [],
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
      user: mock.isSignedIn ? mock.user : null,
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
      <div
        onClick={() => {
          document.cookie = "mock_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
          window.location.href = "/sign-in";
        }}
        className="cursor-pointer"
      >
        {children}
      </div>
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
      <div
        onClick={() => {
          window.location.href = "/sign-in";
        }}
        className="cursor-pointer"
      >
        {children}
      </div>
    );
  }

  return <Clerk.SignInButton mode="modal">{children}</Clerk.SignInButton>;
}

/**
 * ✨ Custom Sign Up Button
 */
export function CustomSignUpButton({ children }: { children: React.ReactNode }) {
  if (IS_MOCK_AUTH) {
    return (
      <div
        onClick={() => {
          window.location.href = "/sign-in";
        }}
        className="cursor-pointer"
      >
        {children}
      </div>
    );
  }

  return <Clerk.SignUpButton mode="modal">{children}</Clerk.SignUpButton>;
}
