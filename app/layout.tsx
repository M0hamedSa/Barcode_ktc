import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ZxingScript from "@/components/ZxingScript";
import { ThemeProvider } from "@/components/ThemeProvider";
// import { ZxingLoader } from "@/components/ZxingLoader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ktc-scanner.vercel.app"), // Replace with your actual domain
  title: {
    default: "KTC Scanner Hub | Production Management",
    template: "%s | KTC Scanner",
  },
  description:
    "Modern barcode scanning and reporting system for KTC production environments.",
  applicationName: "KTC Scanner",
  authors: [{ name: "KTC Production Systems" }],
  generator: "Next.js",
  keywords: [
    "barcode scanner",
    "production tracking",
    "warehouse management",
    "MSSQL",
    "Next.js",
    "KTC",
    "Lay No report",
  ],
  referrer: "origin-when-cross-origin",
  creator: "KTC IT Department",
  publisher: "KTC",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "KTC Scanner | Smart Production Hub",
    description:
      "Streamline your warehouse workflow with real-time barcode scanning and automated reporting.",
    url: "https://ktc-scanner.vercel.app",
    siteName: "KTC Scanner",
    locale: "en_US",
    type: "website",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#020617" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <ZxingScript />
        </ThemeProvider>
      </body>
    </html>
  );
}
