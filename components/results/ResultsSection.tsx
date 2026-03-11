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
        <p className="text-[13px] font-extrabold text-slate-900 dark:text-slate-100">
          Scan Results
        </p>
        <button
          type="button"
          onClick={onClear}
          className="text-[12px] font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
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
