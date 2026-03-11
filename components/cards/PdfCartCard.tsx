export function PdfCartCard({
  layNo,
  selectedCount,
  selectedTotalQty02,
  selectedTotalQty04,
  onExport,
  // onExportErp,
}: {
  layNo: string;
  selectedCount: number;
  selectedTotalQty02: number;
  selectedTotalQty04: number;
  onExport: () => void;
  // onExportErp: () => void;
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
            Total QTY: {selectedTotalQty02}
          </p>
          <p className="text-[12px] text-slate-600 dark:text-slate-400">
            Total GRS QTY: {selectedTotalQty04}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onExport}
        className="mt-4 w-full rounded-2xl bg-emerald-600 dark:bg-emerald-500 text-white py-3 text-[13px] font-extrabold hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
      >
        Export PDF
      </button>
      {/* <button
        onClick={onExportErp}
        className="rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-semibold"
      >
        Export ERP PDF
      </button> */}
    </div>
  );
}
