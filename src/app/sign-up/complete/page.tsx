"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { completeRegistration, type RegistrationIntent } from "@/app/actions/users";
import { REGISTRATION_INTENT_KEY } from "../page";

export default function SignUpCompletePage() {
  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    const intent =
      (sessionStorage.getItem(REGISTRATION_INTENT_KEY) as RegistrationIntent | null) ?? "BUYER";

    completeRegistration(intent).then((result) => {
      sessionStorage.removeItem(REGISTRATION_INTENT_KEY);
      if (result.success) {
        router.replace(result.redirectTo);
      } else {
        setError(result.error);
      }
    });
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
        <p className="text-sm text-rose-600 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
      <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
        Setting up your account...
      </p>
    </div>
  );
}
