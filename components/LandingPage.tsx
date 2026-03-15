"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/components/AuthProvider";
import { Box, ScanLine, LogOut, Shield, Loader2 } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 overflow-hidden p-6 transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-160 h-160 rounded-full bg-emerald-500/20 dark:bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-160 h-160 rounded-full bg-fuchsia-500/20 dark:bg-fuchsia-500/10 blur-[120px] pointer-events-none" />

      {/* Top Bar */}
      <div className="absolute top-6 left-6 right-6 z-50 flex items-center justify-between">
        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {user.username}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  user.role === "admin"
                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
                    : user.role === "supervisor"
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                }`}
              >
                {user.role}
              </span>
            </div>

            {/* Admin Button */}
            {user.role === "admin" && (
              <button
                onClick={() => router.push("/admin")}
                className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                title="User Management"
              >
                <Shield className="w-4 h-4" />
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        <ThemeToggle />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl p-10 shadow-2xl transition-all duration-300">
        {/* Title Section */}
        <div className="flex flex-col items-center mb-10 text-center space-y-3">
          <div className="mb-2">
            <Image
              src="/logo.png"
              alt="Logo"
              width={140}
              height={140}
              className="dark:brightness-200"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            SCANNER
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Select your scanning workspace
          </p>
        </div>

        {/* Buttons Section */}
        <div className="flex flex-col gap-5">
          {/* Default Scanner — supervisor & admin only */}
          {user && (user.role === "supervisor" || user.role === "admin") && (
            <button
              onClick={() => router.push("/def")}
              className="group relative w-full overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-5 text-left shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-emerald-500 dark:hover:ring-emerald-500 hover:shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
            >
              <div className="absolute inset-0 bg-linear-to-r from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center justify-between z-10">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    Add Rolls To Lay No
                  </h2>
                  <p className="text-[12px] sm:text-xs text-slate-500 dark:text-slate-400">
                    اضافة اتواب لرقم فرشه
                  </p>
                </div>
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                  <Box className="w-5 h-5" />
                </div>
              </div>
            </button>
          )}

          {/* ERP Scanner */}
          <button
            onClick={() => router.push("/erp")}
            className="group relative w-full overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-5 text-left shadow-lg ring-1 ring-slate-200 dark:ring-slate-700 hover:ring-fuchsia-500 dark:hover:ring-fuchsia-500 hover:shadow-fuchsia-500/20 transition-all duration-300 hover:-translate-y-1 active:translate-y-0"
          >
            <div className="absolute inset-0 bg-linear-to-r from-fuchsia-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-between z-10">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors">
                  Roll QC
                </h2>
                <p className="text-[12px] sm:text-xs text-slate-500 dark:text-slate-400">
                  تقرير فحص الأتواب
                </p>
              </div>
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/50 text-fuchsia-600 dark:text-fuchsia-400 group-hover:scale-110 transition-transform">
                <ScanLine className="w-5 h-5" />
              </div>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}
