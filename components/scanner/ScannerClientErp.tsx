"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";

import type { ScanEntry } from "./types";
import { useToast } from "../hooks/useToast";
import { useZxingScanner } from "../hooks/useZxingScanner";
import { apiLookupBarcode } from "../utils/api";

import { Toast } from "../ui/Toast";
import { PageHeaderErp } from "../cards/PageHeaderErp";
import { CameraCard } from "../cards/CameraCard";
import { ManualEntryCard } from "../cards/ManualEntryCard";
import { ResultsSectionErp } from "../results/ResultsSectionErp";

export default function ScannerClient() {
  const [zxingReady, setZxingReady] = useState(false);
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [manualInput, setManualInput] = useState("");
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

      const id = addLoadingRow(trimmed);

      try {
        const { res, json } = await apiLookupBarcode(trimmed);

        if (res.ok && json.success) {
          const q02 = Number(json.data?.QTY_02);
          const q04 = Number(json.data?.QTY_04);

          patchRow(id, {
            status: "found",
            data: json.data,
            qty02: Number.isFinite(q02) ? q02 : 0,
            qty04: Number.isFinite(q04) ? q04 : 0,
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
    [addLoadingRow, patchRow, showToast],
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

  useEffect(() => {
    if (window.__zxingReady) {
      setTimeout(() => setZxingReady(true), 0); // avoid sync setState warning
    } else if (window.__zxingError) {
      showToast("Failed to load scanner library", "error");
    }
  }, [showToast]);

  return (
    <>
      {/* <Script
          onLoad={() => setZxingReady(true)}
          onError={() => showToast("Failed to load scanner library", "error")}
        /> */}

      <div className="min-h-screen from-slate-50 via-white to-slate-50">
        <PageHeaderErp scanning={scanning} zxingReady={zxingReady} />

        <main className="mx-auto max-w-md px-4 py-5 flex flex-col gap-5">
          <CameraCard
            zxingReady={zxingReady}
            scanning={scanning}
            camLabel={camLabel}
            onStart={start}
            onStop={stop}
          />

          <ManualEntryCard
            manualInput={manualInput}
            onChange={setManualInput}
            onSubmit={manualSubmit}
          />

          <ResultsSectionErp
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
