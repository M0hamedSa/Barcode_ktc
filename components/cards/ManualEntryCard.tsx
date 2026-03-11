import { Badge } from "../ui/Badge";

export function ManualEntryCard({
  manualInput,
  onChange,
  onSubmit,
}: {
  manualInput: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl p-5 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-extrabold text-slate-900 dark:text-slate-100">
          Manual Entry
        </p>
        <Badge tone="slate">Enter → Search</Badge>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={manualInput}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          placeholder="Type or paste barcode…"
          maxLength={60}
          className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 px-4 py-3 text-[13px] font-medium text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/50 dark:focus:ring-sky-500/50 transition-all shadow-inner"
        />
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3 text-[13px] font-extrabold text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm"
        >
          Add
        </button>
      </div>
    </div>
  );
}
