"use client";

import Script from "next/script";

export function ZxingLoader({ onReady }: { onReady?: () => void }) {
  return (
    <Script
      src="https://unpkg.com/@zxing/library@0.19.1/umd/index.min.js"
      strategy="afterInteractive"
      onLoad={() => onReady?.()}
      onError={() => console.error("Failed to load ZXing")}
    />
  );
}
