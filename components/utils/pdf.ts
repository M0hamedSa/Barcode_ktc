import type { ScanEntry } from "../scanner/types";

export async function exportScanPdf({
  layNo,
  rows,
}: {
  layNo: string;
  rows: ScanEntry[];
}) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();

  const margin = 14;

  // ───────────── Logo ─────────────
  const logo = new Image();
  logo.src = "/logo.png";

  await new Promise((resolve) => {
    logo.onload = resolve;
  });

  doc.addImage(logo, "PNG", margin, 10, 40, 12);

  // ───────────── Header ─────────────
  doc.setFontSize(16);
  doc.text("Barcode Scan Report", margin, 30);

  doc.setFontSize(11);
  doc.text(`Lay No: ${layNo}`, margin, 38);
  doc.text(`Date: ${new Date().toLocaleString()}`, margin, 44);

  // ───────────── Table Rows ─────────────
  const body = rows.map((e) => [
    String(e.barcode ?? ""),
    String(e.data?.WO_NO ?? ""),
    String(e.data?.JO_NO ?? ""),
    String(e.qty02 ?? 0),
    String(e.qty04 ?? 0),
  ]);

  autoTable(doc, {
    startY: 52,
    head: [["Barcode", "WO No", "JO No", "QTY", "QTY GRS"]],
    body,
    theme: "grid",
    styles: {
      fontSize: 10,
      cellPadding: 3,
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { cellWidth: 40 },
      2: { cellWidth: 40 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
    },
  });

  // ───────────── Totals ─────────────
  const totalRolls = rows.length;

  const totalQty02 = rows.reduce((sum, r) => sum + (Number(r.qty02) || 0), 0);

  const totalQty04 = rows.reduce((sum, r) => sum + (Number(r.qty04) || 0), 0);

  // @ts-expect-error jsPDF autotable
  const y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 12 : 70;

  doc.setFontSize(12);

  doc.text(`Total Rolls: ${totalRolls}`, margin, y);
  doc.text(`Total QTY2: ${totalQty02}`, margin, y + 8);
  doc.text(`Total QTY4: ${totalQty04}`, margin, y + 16);

  // ───────────── Save ─────────────
  doc.save(`lay_${layNo}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
