import { useEffect, useMemo, useRef, useState } from "react";
import type { ScanEntry } from "../scanner/types";
import { Badge } from "../ui/Badge";
import { keyDescriptions } from "../scanner/config";

export function ResultCard({
  entry,
  onToggleSelected,
}: {
  entry: ScanEntry;
  onToggleSelected: (id: number) => void;
}) {
  const copyCode = () => navigator.clipboard.writeText(entry.barcode);

  // ✅ collapse/expand state
  const [expanded, setExpanded] = useState(false);

  // ✅ animated height
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [maxH, setMaxH] = useState<number>(0);

  // Optional: hide some keys from details because you already show them in badges
  const hiddenKeys = useMemo(
    () => new Set(["QTY_02", "QTY_04", "QTY_05", "QTY_06"]),
    [],
  );

  // If entry changes (new scan), keep it expanded or collapsed as you like
  // Recalc height when expanded or content changes
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    if (expanded) {
      setMaxH(el.scrollHeight);
    } else {
      setMaxH(0);
    }
  }, [
    expanded,
    entry.data,
    entry.qty02,
    entry.qty04,
    entry.qty05,
    entry.qty06,
  ]);

  // ───────────── keep your loading / not_found / error blocks above ─────────────
  if (entry.status === "loading") {
    return (
      <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 p-4 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 grid place-items-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-300" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Querying database…
            </p>
            <p className="mt-0.5 truncate font-mono text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
              {entry.barcode}
            </p>
          </div>
          <span className="ml-auto text-[10px] sm:text-xs text-slate-500 dark:text-slate-500">
            {entry.time}
          </span>
        </div>
      </div>
    );
  }

  if (entry.status === "not_found" || entry.status === "error") {
    return (
      <div className="rounded-2xl border border-rose-200/50 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/30 p-4 shadow-sm transition-colors">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 grid place-items-center">
            <span className="text-xl">⚠️</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-400">
                {entry.status === "not_found" ? "Not Found" : "Error"}
              </p>
              <Badge tone="rose">{entry.time}</Badge>
            </div>
            <p className="mt-1 text-[11px] sm:text-xs text-rose-700/90 dark:text-rose-400/90">
              {entry.error || "Something went wrong"}
            </p>
            <p className="mt-2 truncate font-mono text-[11px] sm:text-xs text-rose-700/80 dark:text-rose-400/80">
              {entry.barcode}
            </p>
          </div>
          <button
            type="button"
            onClick={copyCode}
            className="rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition"
          >
            Copy
          </button>
        </div>
      </div>
    );
  }

  // ✅ FOUND card (with collapsible details)
  const selected = !!entry.selected;

  const dataEntries = Object.entries(entry.data || {}).filter(
    ([k]) => !hiddenKeys.has(k),
  );

  return (
    <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-linear-to-b from-slate-50 dark:from-slate-800/50 to-white dark:to-slate-900">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone="emerald">Found</Badge>
          <Badge tone="slate">
            QTY NET : {((entry.qty05 ?? 0) + (entry.qty06 ?? 0)).toFixed(2)}
          </Badge>
          <Badge tone="slate">
            QTY GRS : {((entry.qty02 ?? 0) + (entry.qty04 ?? 0)).toFixed(2)}
          </Badge>
          <span className="ml-auto text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
            {entry.time}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">
              Barcode
            </p>
            <p className="truncate font-mono text-sm font-semibold text-slate-900 dark:text-slate-100">
              {entry.barcode}
            </p>
          </div>

          {/* ✅ Toggle details button */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            {expanded ? "Hide" : "Show"}
          </button>

          <button
            type="button"
            disabled={entry.locked}
            onClick={() => onToggleSelected(entry.id)}
            className={`rounded-xl px-3 py-2 text-xs font-semibold border transition
            ${
              entry.locked
                ? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed"
                : selected
                  ? "bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-700"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            }
  `}
          >
            {entry.locked ? "Existing" : selected ? "✓ Added" : "+ Add"}
          </button>
        </div>
      </div>

      {/* ✅ Collapsible details (animated) */}
      <div
        className="transition-[max-height,opacity,transform] duration-300 ease-out"
        style={{
          maxHeight: maxH,
          opacity: expanded ? 1 : 0,
          transform: expanded ? "translateY(0)" : "translateY(-4px)",
        }}
      >
        <div ref={contentRef} className="p-4">
          <div className="grid gap-3">
            {dataEntries.map(([key, val]) => (
              <div
                key={key}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-3"
              >
                <p className="text-[10px] sm:text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">
                  {keyDescriptions[key] || key}
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {String(val ?? "—")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
