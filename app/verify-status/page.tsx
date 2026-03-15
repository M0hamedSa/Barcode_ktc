"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

function VerifyStatusContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const message = searchParams.get("message");

  const isSuccess = status === "success";

  return (
    <div className="relative w-full max-w-md">
      <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl p-8 shadow-2xl transition-all duration-300">
        <div className="text-center">
          {isSuccess ? (
            <>
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 mb-6 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                Email Verified!
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                Your account is now fully active. You can now login to the app.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 px-6 rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              >
                Go to Login
                <ArrowRight className="w-5 h-5" />
              </Link>
            </>
          ) : (
            <>
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mb-6 shadow-xl shadow-red-500/10">
                <XCircle className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
                Verification Failed
              </h1>
              <p className="text-red-500 font-medium mb-4">
                {message || "The verification link is invalid or has expired."}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Please try registering again or contact support if the issue
                persists.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 w-full border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 py-4 px-6 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all shadow-sm"
              >
                Back to Register
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyStatusPage() {
  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="absolute top-[-10%] left-[-10%] w-120 h-120 rounded-full bg-blue-500/10 dark:bg-blue-500/5 blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-120 h-120 rounded-full bg-fuchsia-500/10 dark:bg-fuchsia-500/5 blur-[100px]" />

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <Suspense
        fallback={<Loader2 className="w-10 h-10 animate-spin text-slate-400" />}
      >
        <VerifyStatusContent />
      </Suspense>
    </main>
  );
}
