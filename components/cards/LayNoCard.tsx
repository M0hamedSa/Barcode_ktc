export function LayNoCard({
  layNo,
  onChange,
  onClear,
  loading = false,
}: {
  layNo: string;
  onChange: (v: string) => void;
  onClear: () => void;
  loading?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl p-5 transition-colors relative overflow-hidden">
      {loading && (
        <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500/30 overflow-hidden">
          <div className="h-full bg-emerald-500 animate-[loading_1.5s_infinite_linear]" />
        </div>
      )}

      <style jsx>{`
        @keyframes loading {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-extrabold text-slate-900 dark:text-slate-100">
            Lay No
          </p>
          {loading && (
            <div className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-500" />
          )}
        </div>
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          Required for PDF
        </span>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          value={layNo}
          disabled={loading}
          onChange={(e) => onChange(e.target.value)}
          placeholder={loading ? "Loading rolls..." : "Enter Lay No…"}
          className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 px-4 py-3 text-[13px] font-medium text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={onClear}
          disabled={loading}
          className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-5 py-3 text-[13px] font-extrabold text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
