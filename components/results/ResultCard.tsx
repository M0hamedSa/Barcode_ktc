import React, { useEffect, useMemo, useRef, useState } from "react";
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
  const hiddenKeys = useMemo(() => new Set(["QTY_02", "QTY_04"]), []);

  // If entry changes (new scan), keep it expanded or collapsed as you like
  // Here: auto-expand when found for first time
  useEffect(() => {
    if (entry.status === "found") setExpanded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id]);

  // Recalc height when expanded or content changes
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    if (expanded) {
      setMaxH(el.scrollHeight);
    } else {
      setMaxH(0);
    }
  }, [expanded, entry.data, entry.qty02, entry.qty04]);

  // ───────────── keep your loading / not_found / error blocks above ─────────────
  if (entry.status === "loading") {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {/* ... keep your loading UI ... */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl border border-slate-200 bg-slate-50 grid place-items-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-slate-800">
              Querying database…
            </p>
            <p className="mt-0.5 truncate font-mono text-[12px] text-slate-600">
              {entry.barcode}
            </p>
          </div>
          <span className="ml-auto text-[11px] text-slate-500">
            {entry.time}
          </span>
        </div>
      </div>
    );
  }

  if (entry.status === "not_found" || entry.status === "error") {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
        {/* ... keep your error UI ... */}
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl border border-rose-200 bg-white grid place-items-center">
            <span className="text-xl">⚠️</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-bold text-rose-700">
                {entry.status === "not_found" ? "Not Found" : "Error"}
              </p>
              <Badge tone="rose">{entry.time}</Badge>
            </div>
            <p className="mt-1 text-[12px] text-rose-700/90">
              {entry.error || "Something went wrong"}
            </p>
            <p className="mt-2 truncate font-mono text-[12px] text-rose-700/80">
              {entry.barcode}
            </p>
          </div>
          <button
            type="button"
            onClick={copyCode}
            className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-[12px] font-semibold text-rose-700 hover:bg-rose-100 transition"
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
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 from-slate-50 to-white">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone="emerald">Found</Badge>
          <Badge tone="slate">QTY : {entry.qty02 ?? "—"}</Badge>
          <Badge tone="slate">QTY GRS : {entry.qty04 ?? "—"}</Badge>
          <span className="ml-auto text-[11px] text-slate-500">
            {entry.time}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
              Barcode
            </p>
            <p className="truncate font-mono text-[14px] font-semibold text-slate-900">
              {entry.barcode}
            </p>
          </div>

          {/* ✅ Toggle details button */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            {expanded ? "Hide" : "Show"}
          </button>

          <button
            type="button"
            onClick={() => onToggleSelected(entry.id)}
            className={`rounded-xl px-3 py-2 text-[12px] font-semibold border transition ${
              selected
                ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {selected ? "✓ Added" : "+ Add"}
          </button>

          <button
            type="button"
            onClick={copyCode}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Copy
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
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <p className="text-[11px] font-semibold tracking-wide text-slate-500 uppercase">
                  {keyDescriptions[key] || key}
                </p>
                <p className="mt-1 text-[14px] font-semibold text-slate-900">
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
