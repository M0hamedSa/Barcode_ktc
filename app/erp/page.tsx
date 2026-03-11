import { Metadata } from "next";
import ScannerClient2 from "@/components/scanner/ScannerClientErp";

export const metadata: Metadata = {
  title: "Roll QC Report | KTC Scanner",
  description:
    "Detailed ERP Roll Quality Control. Generate RTL PDF reports with Arabic status mapping and defect tracking.",
};

export default function Home() {
  return <ScannerClient2 />;
}
