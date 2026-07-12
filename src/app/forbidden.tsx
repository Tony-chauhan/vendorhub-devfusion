import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function Forbidden() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 px-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center flex flex-col items-center space-y-4 max-w-md shadow-sm">
        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 border border-rose-100">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-xl font-extrabold text-slate-900">403 — Forbidden</h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Your account doesn&apos;t have permission to access this area.
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-full shadow-md"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
