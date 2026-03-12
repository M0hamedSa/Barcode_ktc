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
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const trackRef = useRef<MediaStreamTrack | null>(null);
  const codeReaderRef = useRef<InstanceType<
    typeof window.ZXing.BrowserMultiFormatReader
  > | null>(null);

  const cooldownRef = useRef(false);
  const lastScannedRef = useRef<string | null>(null);

  // ✅ Use refs to handle stale closures for callbacks
  const scanCallbackRef = useRef(onScanText);
  const errorCallbackRef = useRef(onError);

  useEffect(() => {
    scanCallbackRef.current = onScanText;
  }, [onScanText]);

  useEffect(() => {
    errorCallbackRef.current = onError;
  }, [onError]);

  const start = useCallback(async () => {
    if (scanning || !zxingReady) return;

    try {
      const codeReader = new window.ZXing.BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      // 1. Get all video devices
      const videoDevices = await (codeReader as any).listVideoInputDevices();
      if (!videoDevices || videoDevices.length === 0) {
        throw new Error("No cameras found");
      }

      // 2. Select the best back camera
      // Heuristic: look for "back", "rear", or "environment" in label.
      // If many, pick the last one (usually the main camera vs ultra-wide/tele).
      const backCameras = videoDevices.filter((v: any) => {
        const label = (v.label || "").toLowerCase();
        return (
          label.includes("back") ||
          label.includes("rear") ||
          label.includes("environment") ||
          label.includes("facing")
        );
      });

      const selectedId =
        backCameras.length > 0
          ? backCameras[backCameras.length - 1].deviceId
          : videoDevices[videoDevices.length - 1].deviceId;

      setScanning(true);
      setCamLabel("SCANNING");

      await codeReader.decodeFromVideoDevice(selectedId, "preview", (r) => {
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
        scanCallbackRef.current(text); // ✅ Use latest ref callback
        setTimeout(() => setCamLabel("SCANNING"), 1200);
      });

      // 3. Apply advanced focus constraints and check for torch
      const video = document.getElementById(
        "preview",
      ) as HTMLVideoElement | null;
      if (video?.srcObject) {
        const track = (video.srcObject as MediaStream).getVideoTracks()[0];
        if (track) {
          trackRef.current = track;
          try {
            const capabilities = (track as any).getCapabilities?.() || {};
            const constraints: any = {};

            // Check if torch is supported
            if ("torch" in capabilities) {
              setTorchSupported(true);
            }

            if (capabilities.focusMode?.includes("continuous")) {
              constraints.focusMode = "continuous";
            }
            if (capabilities.whiteBalanceMode?.includes("continuous")) {
              constraints.whiteBalanceMode = "continuous";
            }

            if (Object.keys(constraints).length > 0) {
              await track.applyConstraints({ advanced: [constraints] });
            }
          } catch (e) {
            console.warn("Failed to apply advanced focus constraints", e);
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      errorCallbackRef.current(msg); // ✅ Use latest callback
      setScanning(false);
      setCamLabel("READY");
    }
  }, [scanning, zxingReady]); // ✅ Removed onScanText, onError

  const toggleTorch = useCallback(async () => {
    if (!trackRef.current || !torchSupported) return;
    try {
      const newState = !torchOn;
      await trackRef.current.applyConstraints({
        advanced: [{ torch: newState } as any],
      });
      setTorchOn(newState);
    } catch (e) {
      console.error("Failed to toggle torch", e);
    }
  }, [torchOn, torchSupported]);

  const stop = useCallback(() => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }

    setScanning(false);
    setCamLabel("READY");
    setTorchOn(false);
    setTorchSupported(false);
    trackRef.current = null;
    lastScannedRef.current = null;
    cooldownRef.current = false;

    const video = document.getElementById("preview") as HTMLVideoElement | null;
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      video.srcObject = null;
    }
  }, []);

  useEffect(() => () => stop(), [stop]);

  return {
    scanning,
    camLabel,
    torchOn,
    torchSupported,
    toggleTorch,
    start,
    stop,
  };
}
