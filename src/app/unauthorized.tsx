import Link from "next/link";
import { LockKeyhole } from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center space-y-4 max-w-md shadow-sm">
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100">
          <LockKeyhole className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">401 — Sign In Required</h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Please sign in to access this page.
        </p>
        <Link
          href="/sign-in"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-full shadow-md"
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}
