
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
        <div className="rounded-3xl border border-gray-500 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between">
                <p className="text-[12px] font-extrabold text-slate-900">Lay No</p>
                <span className="text-[11px] font-semibold text-slate-500">
                    Required for PDF
                </span>
            </div>

            <div className="mt-3 flex gap-2">
                <input
                    type="text"
                    value={layNo}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Enter Lay No…"
                    className="flex-1 rounded-2xl border border-gray-400 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-400 transition"
                />
                <button
                    type="button"
                    onClick={onClear}
                    className="rounded-2xl border border-gray-400 bg-white px-4 py-3 text-[13px] font-extrabold text-slate-900 hover:bg-slate-50 transition"
                >
                    Clear
                </button>
            </div>
        </div>
    );
}