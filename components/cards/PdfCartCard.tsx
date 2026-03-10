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
    <div className="rounded-3xl border border-gray-500 bg-white shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] font-extrabold text-slate-900">PDF Cart</p>
          <p className="text-[12px] text-slate-500">Add results then export.</p>
          <p className="text-[12px] text-slate-600 mt-1">
            Lay No: <span className="font-semibold">{layNo.trim() || "—"}</span>
          </p>
        </div>

        <div className="text-right">
          <p className="text-[12px] font-semibold text-slate-900">
            Items: {selectedCount}
          </p>
          <p className="text-[12px] text-slate-600">
            Total QTY: {selectedTotalQty02}
          </p>
          <p className="text-[12px] text-slate-600">
            Total GRS QTY: {selectedTotalQty04}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onExport}
        className="mt-3 w-full rounded-2xl bg-emerald-600 text-white py-3 text-[13px] font-extrabold hover:bg-emerald-700 transition"
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
