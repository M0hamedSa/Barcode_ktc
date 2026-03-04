import type { ToastType } from "../scanner/types";

export function Toast({ msg, type }: { msg: string; type: ToastType }) {
    const base =
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-full px-4 py-2 text-[12px] font-medium shadow-lg border backdrop-blur";

    const styles =
        type === "success"
            ? "bg-emerald-50/90 border-emerald-200 text-emerald-700"
            : type === "error"
                ? "bg-rose-50/90 border-rose-200 text-rose-700"
                : "bg-slate-50/90 border-slate-200 text-slate-700";

    return <div className={`${base} ${styles}`}>{msg}</div>;
}