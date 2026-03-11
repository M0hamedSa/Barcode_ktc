export function LayNoCard({
  layNo,
  onChange,
  onClear,
}: {
  layNo: string;
  onChange: (v: string) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl p-5 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-extrabold text-slate-900 dark:text-slate-100">
          Lay No
        </p>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          Required for PDF
        </span>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={layNo}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter Lay No…"
          className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 px-4 py-3 text-[13px] font-medium text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500/50 transition-all"
        />
        <button
          type="button"
          onClick={onClear}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3 text-[13px] font-extrabold text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
