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
  title: "KTC Scanner | Professional Barcode Management",
  description:
    "Modern barcode scanning and Lay No reporting system for production and warehouse environments. Real-time data sync with MSSQL and professional PDF exports.",
  keywords: [
    "barcode scanner",
    "production tracking",
    "warehouse management",
    "MSSQL",
    "Next.js",
    "KTC",
    "Lay No report",
  ],
  authors: [{ name: "KTC Production Systems" }],
  openGraph: {
    title: "KTC Scanner | Smart Production Tracking",
    description:
      "Steamline your warehouse workflow with real-time barcode scanning and automated reporting.",
    type: "website",
    locale: "en_US",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport = {
  themeColor: "#059669", // emerald-600
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
