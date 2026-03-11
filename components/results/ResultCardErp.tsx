import { useEffect, useMemo, useRef, useState } from "react";
import type { ScanEntry } from "../scanner/types";
import { Badge } from "../ui/Badge";
import { keyDescriptions } from "../scanner/config";

export function ResultCardErp({
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

  const exportErpPdf = async (barcode: string) => {
    const res = await fetch("/api/erp-rolls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ barcode }),
    });

    // Check for HTTP errors before parsing JSON
    if (!res.ok) {
      const text = await res.text(); // Read raw response to debug
      console.error("API error:", res.status, text);
      throw new Error(`API returned ${res.status}: ${text}`);
    }

    const json = await res.json();
    // Guard against missing rows
    if (!json.rows) {
      console.error("Unexpected response shape:", json);
      throw new Error("Response missing 'rows' field");
    }

    const { exportErpPdf } = await import("@/components/utils/erpdf");
    await exportErpPdf(json.rows);
  };

  // ───────────── keep your loading / not_found / error blocks above ─────────────
  if (entry.status === "loading") {
    return (
      <div className="rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white dark:bg-slate-900 p-4 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 grid place-items-center">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-slate-600 dark:border-t-slate-300" />
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-200">
              Querying database…
            </p>
            <p className="mt-0.5 truncate font-mono text-[12px] text-slate-600 dark:text-slate-400">
              {entry.barcode}
            </p>
          </div>
          <span className="ml-auto text-[11px] text-slate-500 dark:text-slate-500">
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
              <p className="text-[13px] font-bold text-rose-700 dark:text-rose-400">
                {entry.status === "not_found" ? "Not Found" : "Error"}
              </p>
              <Badge tone="rose">{entry.time}</Badge>
            </div>
            <p className="mt-1 text-[12px] text-rose-700/90 dark:text-rose-400/90">
              {entry.error || "Something went wrong"}
            </p>
            <p className="mt-2 truncate font-mono text-[12px] text-rose-700/80 dark:text-rose-400/80">
              {entry.barcode}
            </p>
          </div>
          <button
            type="button"
            onClick={copyCode}
            className="rounded-xl border border-rose-200 dark:border-rose-800 bg-white dark:bg-slate-900 px-3 py-2 text-[12px] font-semibold text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition"
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
          <Badge tone="slate">QTY : {entry.qty02 ?? "—"}</Badge>
          <Badge tone="slate">QTY GRS : {entry.qty04 ?? "—"}</Badge>
          <span className="ml-auto text-[11px] text-slate-500 dark:text-slate-400">
            {entry.time}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">
              Barcode
            </p>
            <p className="truncate font-mono text-[14px] font-semibold text-slate-900 dark:text-slate-100">
              {entry.barcode}
            </p>
          </div>
          {/* ✅ Toggle details button */}
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-[12px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
          >
            {expanded ? "Hide" : "Show"}
          </button>

          <button
            type="button"
            className="rounded-xl border border-fuchsia-500 dark:border-fuchsia-500/50 bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-400 px-3 py-2 text-[12px] font-bold hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/60 transition shadow-sm active:scale-95"
            onClick={() => exportErpPdf(entry.barcode)}
          >
            Export
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
                <p className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">
                  {keyDescriptions[key] || key}
                </p>
                <p className="mt-1 text-[14px] font-semibold text-slate-900 dark:text-slate-100">
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
