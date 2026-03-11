export type ToastType = "success" | "error" | "info";
export type ScanStatus = "loading" | "found" | "not_found" | "error";

export interface ScanEntry {
  id: number;
  barcode: string;
  time: string;
  status: ScanStatus;
  data?: Record<string, unknown>;
  qty02?: number;
  qty04?: number;
  qty05?: number;
  qty06?: number;
  selected?: boolean;
  error?: string;
  locked?: boolean;
}

declare global {
  interface Window {
    ZXing: {
      BrowserMultiFormatReader: new () => {
        decodeFromVideoDevice(
          deviceId: string | null,
          videoElement: string | HTMLVideoElement,
          callback: (
            result: { getText(): string } | null,
            err?: unknown,
          ) => void,
        ): Promise<void>;
        reset(): void;
      };
    };
  }
}

declare global {
  interface Window {
    __zxingReady?: boolean;
    __zxingError?: boolean;
  }
}
