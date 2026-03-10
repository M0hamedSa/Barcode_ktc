"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6">
      <div className="w-full max-w-md rounded-3xl border border-[#2a3a55] bg-[#111827] p-8 shadow-xl">
        {/* Title */}
        <h1 className="text-center text-2xl font-extrabold text-white mb-6">
          Barcode Scanner
        </h1>

        {/* Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push("/def")}
            className="w-full rounded-2xl bg-emerald-600 py-4 text-[15px] font-bold text-white hover:bg-emerald-700 transition"
          >
            Default Scanner
          </button>

          <button
            onClick={() => router.push("/erp")}
            className="w-full rounded-2xl bg-blue-600 py-4 text-[15px] font-bold text-white hover:bg-blue-700 transition"
          >
            ERP Scanner
          </button>
        </div>
      </div>
    </main>
  );
}
