"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import Script from "next/script";

import type { ScanEntry } from "./types";
import { useToast } from "../hooks/useToast";
import { useZxingScanner } from "../hooks/useZxingScanner";
import { apiLookupBarcode } from "../utils/api";
import { exportScanPdf } from "../utils/pdf";

import { Toast } from "../ui/Toast";
import { PageHeader } from "../cards/PageHeader";
import { LayNoCard } from "../cards/LayNoCard";
import { CameraCard } from "../cards/CameraCard";
import { PdfCartCard } from "../cards/PdfCartCard";
import { ManualEntryCard } from "../cards/ManualEntryCard";
import { ResultsSection } from "../results/ResultsSection";

export default function ScannerClient() {
  const [zxingReady, setZxingReady] = useState(false);
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [manualInput, setManualInput] = useState("");
  const [layNo, setLayNo] = useState("");
  const beepRef = useRef<HTMLAudioElement | null>(null);
  const entryIdRef = useRef(0);
  const { toast, showToast } = useToast();

  useEffect(() => {
    const audio = new Audio("/beep.mp3");
    audio.preload = "auto";
    audio.volume = 0.5;
    beepRef.current = audio;
  }, []);

  const addLoadingRow = useCallback((barcode: string) => {
    const id = ++entryIdRef.current;
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    setHistory((prev) => [{ id, barcode, time, status: "loading" }, ...prev]);
    return id;
  }, []);

  const patchRow = useCallback((id: number, patch: Partial<ScanEntry>) => {
    setHistory((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    );
  }, []);

  const lookupBarcode = useCallback(
    async (barcode: string) => {
      const trimmed = barcode.trim();
      if (!trimmed) {
        showToast("Enter a barcode first", "error");
        return;
      }

      // Check for duplicates
      if (history.some((e) => e.barcode === trimmed)) {
        showToast("Barcode " + trimmed + " already added", "error");
        return;
      }

      const id = addLoadingRow(trimmed);

      try {
        const { res, json } = await apiLookupBarcode(trimmed);

        if (res.ok && json.success) {
          const q02 = Number(json.data?.QTY_02);
          const q04 = Number(json.data?.QTY_04);
          const q05 = Number(json.data?.QTY_05);
          const q06 = Number(json.data?.QTY_06);

          patchRow(id, {
            status: "found",
            data: json.data,
            qty02: Number.isFinite(q02) ? q02 : 0,
            qty04: Number.isFinite(q04) ? q04 : 0,
            qty05: Number.isFinite(q05) ? q05 : 0,
            qty06: Number.isFinite(q06) ? q06 : 0,
            selected: false,
          });
          return;
        }

        if (res.status === 404) {
          patchRow(id, {
            status: "not_found",
            error: json.error || "No record found",
          });
          return;
        }

        patchRow(id, { status: "error", error: json.error || "Server error" });
      } catch {
        patchRow(id, { status: "error", error: "Cannot reach server" });
      }
    },
    [addLoadingRow, patchRow, showToast, history],
  );

  const { scanning, camLabel, start, stop } = useZxingScanner({
    zxingReady,
    onScanText: (text) => {
      if (beepRef.current) {
        beepRef.current.currentTime = 0;
        beepRef.current.play().catch(() => {});
      }

      showToast("Scanned: " + text, "success");
      void lookupBarcode(text);
    },
    onError: (msg) => showToast("Camera error: " + msg, "error"),
  });

  const toggleSelected = useCallback((id: number) => {
    setHistory((prev) =>
      prev.map((e) => (e.id === id ? { ...e, selected: !e.selected } : e)),
    );
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  const manualSubmit = useCallback(() => {
    const val = manualInput.trim();
    if (!val) {
      showToast("Enter a barcode first", "error");
      return;
    }
    void lookupBarcode(val);
    setManualInput("");
  }, [manualInput, lookupBarcode, showToast]);

  const selectedRows = useMemo(
    () => history.filter((e) => e.status === "found" && e.selected),
    [history],
  );

  const selectedCount = selectedRows.length;

  const selectedTotalQty = useMemo(
    () =>
      selectedRows.reduce(
        (sum, e) => sum + (Number(e.qty02) || 0) + (Number(e.qty04) || 0),
        0,
      ),
    [selectedRows],
  );

  const selectedTotalQtyGrs = useMemo(
    () =>
      selectedRows.reduce(
        (sum, e) => sum + (Number(e.qty05) || 0) + (Number(e.qty06) || 0),
        0,
      ),
    [selectedRows],
  );

  const exportPdf = useCallback(async () => {
    const lay = layNo.trim();
    if (!lay) {
      showToast("Please enter Lay No first", "error");
      return;
    }

    const selectedRows = history.filter(
      (e) => e.status === "found" && e.selected,
    );
    if (selectedRows.length === 0) {
      showToast("No items added to PDF", "error");
      return;
    }

    const selectedBarcodes = selectedRows.map((e) => e.barcode);

    // ✅ 1) Save Lay No to DB for selected barcodes only
    try {
      const res = await fetch("/api/save-lay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layNo: lay, barcodes: selectedBarcodes }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        showToast(json.error || "Failed to save Lay No", "error");
        return;
      }

      showToast(`Saved Lay No for ${json.updated} rows`, "success");
    } catch {
      showToast("Cannot reach server to save Lay No", "error");
      return;
    }

    // ✅ 2) After DB save succeeds → generate pdf
    await exportScanPdf({ layNo: lay, rows: selectedRows });
  }, [layNo, history, showToast]);

  const loadLayNo = useCallback(
    async (lay: string) => {
      try {
        const res = await fetch("/api/lay-lookup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ layNo: lay }),
        });
        const json = await res.json();

        if (!res.ok || !json.success) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rows = json.rows.map((r: any) => ({
          id: Math.random(),
          barcode: r.ROLL_BARCODE,
          time: "Existing",
          status: "found",
          data: r,
          qty02: Number(r.QTY_02) || 0,
          qty04: Number(r.QTY_04) || 0,
          qty05: Number(r.QTY_05) || 0,
          qty06: Number(r.QTY_06) || 0,
          selected: true,
          locked: true, // 🔒 cannot remove
        }));

        setHistory(rows);
      } catch {
        showToast("Cannot load Lay No data", "error");
      }
    },
    [showToast],
  );

  const handleLayNoChange = useCallback(
    (val: string) => {
      setLayNo(val);

      // Only fetch when it looks valid
      if (val.trim().length > 0) {
        void loadLayNo(val.trim());
      }
    },
    [loadLayNo],
  );

  useEffect(() => {
    if (window.__zxingReady) {
      setTimeout(() => setZxingReady(true), 0); // avoid sync setState warning
    } else if (window.__zxingError) {
      showToast("Failed to load scanner library", "error");
    }
  }, [showToast]);

  return (
    <>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
        {/* Emerald accent background decorations - wrapped to prevent body overflow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-160 h-160 rounded-full bg-emerald-500/20 dark:bg-emerald-500/10 blur-[120px]" />
        </div>

        <PageHeader scanning={scanning} zxingReady={zxingReady} />

        <main className="mx-auto max-w-md px-4 py-5 flex flex-col gap-5">
          <LayNoCard
            layNo={layNo}
            onChange={handleLayNoChange} // 👈 use this instead of setLayNo
            onClear={() => {
              setLayNo("");
              setHistory([]); // optional: clear loaded rows
            }}
          />
          <CameraCard
            zxingReady={zxingReady}
            scanning={scanning}
            camLabel={camLabel}
            onStart={start}
            onStop={stop}
          />

          <PdfCartCard
            layNo={layNo}
            selectedCount={selectedCount}
            selectedTotalQty={selectedTotalQty}
            selectedTotalQtyGrs={selectedTotalQtyGrs}
            onExport={exportPdf}
          />

          <ManualEntryCard
            manualInput={manualInput}
            onChange={setManualInput}
            onSubmit={manualSubmit}
          />

          <ResultsSection
            history={history}
            onClear={clearHistory}
            onToggleSelected={toggleSelected}
          />
        </main>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </>
  );
}
