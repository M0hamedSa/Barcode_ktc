import { DEFECT_LABELS, DYE_DEFECT_LABELS } from "../scanner/config";

export async function exportErpPdf(rows: any[]) {
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
    } else {
      console.warn("Could not fetch Amiri font.");
    }
  } catch (error) {
    console.error("Failed to load Arabic font:", error);
  }

  const buildGridBody = (fields: { label: string; value: any }[]) => {
    const body = [];
    for (let i = 0; i < fields.length; i += 2) {
      const left = fields[i];
      const right = fields[i + 1] ?? { label: "", value: "" };
      body.push([left.label, left.value ?? "", right.label, right.value ?? ""]);
    }
    return body;
  };

  const row = rows[0] ?? {};

  // DYE: uses DYE_DEFECT_LABELS (DYE_DEFECT_01 to DYE_DEFECT_24)
  const dyeFields = Array.from({ length: 24 }, (_, i) => {
    const key = `DYE_DEFECT_${String(i + 1).padStart(2, "0")}`;
    return {
      label: DYE_DEFECT_LABELS[key] ?? key,
      value: row[key] ?? "",
    };
  });

  // KNT: uses DEFECT_LABELS (DEFECT_01 to DEFECT_20, fallback to key after 20)
  const kntFields = Array.from({ length: 20 }, (_, i) => {
    const key = `DEFECT_${String(i + 1).padStart(2, "0")}`;
    return {
      label: DEFECT_LABELS[key] ?? key,
      value: row[key] ?? "",
    };
  });

  // ── Header ──
  doc.setFontSize(16);
  doc.text("ERP Roll Report", 14, 18);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${new Date().toLocaleString()}`, 14, 26);

  // ── DYE Table ──
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("DYE", 14, 36);

  autoTable(doc, {
    startY: 40,
    head: [["Desc", "Value", "Desc", "Value"]],
    body: buildGridBody(dyeFields),
    theme: "grid",
    styles: { font: "Amiri", fontStyle: "normal" },
    headStyles: {
      fillColor: [41, 128, 185],
      font: "Amiri",
      fontStyle: "normal",
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 45 },
      2: { cellWidth: 45 },
      3: { cellWidth: 45 },
    },
  });

  // ── KNT Table ──
  const kntY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("KNT", 14, kntY);

  autoTable(doc, {
    startY: kntY + 4,
    head: [["Desc", "Value", "Desc", "Value"]],
    body: buildGridBody(kntFields),
    theme: "grid",
    styles: { font: "Amiri", fontStyle: "normal" },
    headStyles: {
      fillColor: [39, 174, 96],
      font: "Amiri",
      fontStyle: "normal",
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 45 },
      2: { cellWidth: 45 },
      3: { cellWidth: 45 },
    },
  });

  doc.save("erp_roll_report.pdf");
}
