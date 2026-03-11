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

  try {
    const fontRes = await fetch("/fonts/Amiri-Regular.ttf");
    if (fontRes.ok) {
      const fontBuf = await fontRes.arrayBuffer();
      const bytes = new Uint8Array(fontBuf);
      let binary = "";
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64Font = btoa(binary);
      doc.addFileToVFS("Amiri-Regular.ttf", base64Font);
      doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
      doc.setFont("Amiri");
    }
  } catch (error) {
    console.warn("Failed to load Arabic font in default PDF:", error);
  }

  const margin = 16;

  // ───────────── Logo ─────────────
  const logo = new Image();
  logo.src = "/logo.png";

  await new Promise((resolve) => {
    logo.onload = resolve;
  });

  doc.addImage(logo, "PNG", margin, 5, 45, 25);

  // ───────────── Header ─────────────
  doc.setFontSize(18);
  doc.text("Barcode Scan Report", margin, 32);

  doc.setFontSize(11);
  doc.text(`Lay No: ${layNo}`, margin, 40);
  doc.text(`Date: ${new Date().toLocaleString()}`, margin, 46);

  const JsBarcode = (await import("jsbarcode")).default;

  // ───────────── Table Rows ─────────────
  const body = rows.map((e) => {
    let barcodeDataUrl = "";
    if (e.barcode) {
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, String(e.barcode), {
        format: "CODE128",
        displayValue: false,
        height: 20,
        margin: 0,
      });
      barcodeDataUrl = canvas.toDataURL("image/png");
    }

    return [
      { content: String(e.barcode ?? ""), barcodeDataUrl }, // Column 0: Includes text for autoTable to render
      String(e.data?.WO_NO ?? ""),
      String(e.data?.JO_NO ?? ""),
      ((Number(e.qty02) || 0) + (Number(e.qty04) || 0)).toFixed(2),
      ((Number(e.qty05) || 0) + (Number(e.qty06) || 0)).toFixed(2),
      String(e.barcode ?? ""), // Column 5: Barcode Text (Hidden)
    ];
  });

  autoTable(doc, {
    startY: 52,
    head: [["Barcode", "WO No", "JO No", "QTY (Net)", "QTY (GRS)"]],
    body,
    theme: "grid",
    styles: {
      fontSize: 9,
      cellPadding: 1,
      font: "Amiri",
      minCellHeight: 16,
      valign: "bottom",
      halign: "center",
    },
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      font: "Amiri",
      halign: "center",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: margin, right: margin },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 38 },
      2: { cellWidth: 38 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
    },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 0) {
        const raw = data.cell.raw as { barcodeDataUrl?: string };
        const barcodeDataUrl = raw?.barcodeDataUrl;
        if (barcodeDataUrl) {
          const imgWidth = data.cell.width - 6;
          const imgHeight = 9;
          const xPos = data.cell.x + 3;
          const yPos = data.cell.y + 2; // Position image at the top
          doc.addImage(barcodeDataUrl, "PNG", xPos, yPos, imgWidth, imgHeight);
        }
      }
    },
  });

  // ───────────── Totals ─────────────
  const totalRolls = rows.length;

  const totalQty = rows.reduce(
    (sum, r) => sum + (Number(r.qty02) || 0) + (Number(r.qty04) || 0),
    0,
  );

  const totalQtyGrs = rows.reduce(
    (sum, r) => sum + (Number(r.qty05) || 0) + (Number(r.qty06) || 0),
    0,
  );

  // @ts-expect-error jsPDF autotable
  const y = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 12 : 70;

  doc.setFontSize(12);

  doc.text(`Total Rolls: ${totalRolls}`, margin, y);
  doc.text(`Total Net QTY: ${totalQty.toFixed(2)}`, margin, y + 8);
  doc.text(`Total GRS QTY: ${totalQtyGrs.toFixed(2)}`, margin, y + 16);

  // ───────────── Save ─────────────
  doc.save(`LAY_${layNo}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
