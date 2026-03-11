import { Metadata } from "next";
import ScannerClient from "@/components/scanner/ScannerClient";

export const metadata: Metadata = {
  title: "Add Rolls to Lay No | KTC Scanner",
  description:
    "Efficiently scan and add rolls to Lay numbers. Export professional PDF reports for production tracking.",
};

export default function Home() {
  return <ScannerClient />;
}
