import { useCallback, useEffect, useRef, useState } from "react";
import { playBeep } from "../utils/beep";

export function useZxingScanner({
  zxingReady,
  onScanText,
  onError,
}: {
  zxingReady: boolean;
  onScanText: (text: string) => void;
  onError: (msg: string) => void;
}) {
  const [scanning, setScanning] = useState(false);
  const [camLabel, setCamLabel] = useState("READY");
  const codeReaderRef = useRef<InstanceType<
    typeof window.ZXing.BrowserMultiFormatReader
  > | null>(null);

  const cooldownRef = useRef(false);
  const lastScannedRef = useRef<string | null>(null);

  const start = useCallback(async () => {
    if (scanning || !zxingReady) return;

    try {
      codeReaderRef.current = new window.ZXing.BrowserMultiFormatReader();
      setScanning(true);
      setCamLabel("SCANNING");

      await codeReaderRef.current.decodeFromVideoDevice(
        null,
        "preview",
        (r) => {
          if (!r || cooldownRef.current) return;

          const text = r.getText();
          if (!text || text === lastScannedRef.current) return;

          lastScannedRef.current = text;
          cooldownRef.current = true;

          setTimeout(() => {
            cooldownRef.current = false;
            lastScannedRef.current = null;
          }, 2500);

          setCamLabel("GOT IT");
          playBeep();
          onScanText(text);
          setTimeout(() => setCamLabel("SCANNING"), 1200);
        },
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      onError(msg);
      setScanning(false);
      setCamLabel("READY");
    }
  }, [scanning, zxingReady, onScanText, onError]);

  const stop = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }

    setScanning(false);
    setCamLabel("READY");
    lastScannedRef.current = null;
    cooldownRef.current = false;

    const video = document.getElementById("preview") as HTMLVideoElement | null;
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return { scanning, camLabel, start, stop };
}
