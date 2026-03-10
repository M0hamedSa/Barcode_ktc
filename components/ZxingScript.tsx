"use client";
import Script from "next/script";

export default function ZxingScript() {
  return (
    <Script
      src="https://unpkg.com/@zxing/library@0.19.1/umd/index.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        window.__zxingReady = true;
      }}
      onError={() => {
        window.__zxingError = true;
      }}
    />
  );
}
