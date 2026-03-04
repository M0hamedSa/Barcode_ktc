import React from "react";
import type { ScanEntry } from "../scanner/types";
import { ResultCard } from "./ResultCard";

export function ResultsSection({
    history,
    onClear,
    onToggleSelected,
}: {
    history: ScanEntry[];
    onClear: () => void;
    onToggleSelected: (id: number) => void;
}) {
    if (history.length === 0) return null;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <p className="text-[12px] font-extrabold text-slate-900">Scan Results</p>
                <button
                    type="button"
                    onClick={onClear}
                    className="text-[12px] font-semibold text-slate-600 hover:text-rose-600 transition"
                >
                    Clear
                </button>
            </div>

            <div className="flex flex-col gap-3">
                {history.map((entry) => (
                    <ResultCard
                        key={entry.id}
                        entry={entry}
                        onToggleSelected={onToggleSelected}
                    />
                ))}
            </div>
        </div>
    );
}