import { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "KTC Scanner Hub | Select Workspace",
  description:
    "Manage your production workflow with KTC Scanner. Choose between Lay No reporting and ERP Roll Quality Control.",
  keywords: "barcode scanner, KTC, production tracking, lay report, ERP QC",
};

export default function Home() {
  return <LandingPage />;
}
