import React from "react";

export function Badge({
    children,
    tone = "slate",
}: {
    children: React.ReactNode;
    tone?: "slate" | "emerald" | "rose" | "sky";
}) {
    const map: Record<string, string> = {
        slate: "bg-slate-100 text-slate-700 border-slate-200",
        emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
        rose: "bg-rose-100 text-rose-700 border-rose-200",
        sky: "bg-sky-100 text-sky-700 border-sky-200",
    };

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${map[tone]}`}
        >
            {children}
        </span>
    );
}