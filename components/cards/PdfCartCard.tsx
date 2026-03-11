export function PdfCartCard({
  layNo,
  selectedCount,
  selectedTotalQty,
  selectedTotalQtyGrs,
  onExport,
  loading = false,
}: {
  layNo: string;
  selectedCount: number;
  selectedTotalQty: number;
  selectedTotalQtyGrs: number;
  onExport: () => void;
  loading?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-slate-200/50 dark:border-slate-800/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-xl p-5 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px] font-extrabold text-slate-900 dark:text-slate-100">
            PDF Cart
          </p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            Add results then export.
          </p>
          <p className="text-[12px] text-slate-600 dark:text-slate-300 mt-1">
            Lay No:{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {layNo.trim() || "—"}
            </span>
          </p>
        </div>

        <div className="text-right">
          <p className="text-[12px] font-semibold text-slate-900 dark:text-slate-100">
            Items: {selectedCount}
          </p>
          <p className="text-[12px] text-slate-600 dark:text-slate-400">
            Total Net QTY: {selectedTotalQty.toFixed(2)}
          </p>
          <p className="text-[12px] text-slate-600 dark:text-slate-400">
            Total GRS QTY: {selectedTotalQtyGrs.toFixed(2)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onExport}
        disabled={loading}
        className="mt-4 w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white py-3 text-[13px] font-extrabold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            <span>Exporting...</span>
          </>
        ) : (
          "Export PDF"
        )}
      </button>
    </div>
  );
}
