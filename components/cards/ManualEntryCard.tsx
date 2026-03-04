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
        <div className="rounded-3xl border border-gray-500 bg-white shadow-sm p-4">
            <div className="flex items-center justify-between">
                <p className="text-[12px] font-extrabold text-slate-900">Manual Entry</p>
                <Badge tone="slate">Enter → Search</Badge>
            </div>

            <div className="mt-3 flex gap-2">
                <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && onSubmit()}
                    placeholder="Type or paste barcode…"
                    maxLength={60}
                    className="flex-1 rounded-2xl border border-gray-500 bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-900 outline-none focus:bg-white focus:border-slate-400 transition"
                />
                <button
                    type="button"
                    onClick={onSubmit}
                    className="rounded-2xl border border-gray-500 bg-white px-4 py-3 text-[13px] font-extrabold text-slate-900 hover:bg-slate-50 transition"
                >
                    Add
                </button>
            </div>
        </div>
    );
}