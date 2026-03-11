import { DEFECT_LABELS, DYE_DEFECT_LABELS } from "../scanner/config";

export async function exportErpPdf(rows: Record<string, any>[]) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;
  const doc: any = new jsPDF();

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

  const buildGridBody = (
    fields: { label: string; value: string | number }[],
  ) => {
    const body = [];
    for (let i = 0; i < fields.length; i += 2) {
      const field1 = fields[i];
      const field2 = fields[i + 1] ?? { label: "", value: "" };
      // [Value2, Label2, Value1, Label1] for RTL flow
      body.push([
        field2.value ?? "",
        field2.label,
        field1.value ?? "",
        field1.label,
      ]);
    }
    return body;
  };

  const row = rows[0] ?? {};

  const getKntStatusText = (status: string | number | undefined | null) => {
    const str = status != null ? String(status).trim().toUpperCase() : "";
    if (!str || str === "NULL") return `تحت الفحص`;

    if (str === "00" || str === "0") return `نشط`;
    if (str === "01" || str === "1") return `جديد`;
    if (str === "02" || str === "2") return `مؤكد`;
    if (str === "03" || str === "3") return `مغلق`;
    if (str === "04" || str === "4") return `مقبول`;
    if (str === "05" || str === "5") return `مرفوض`;
    if (str === "06" || str === "6") return `محول`;
    if (str === "07" || str === "7") return `تحت المعالجة`;
    if (str === "08" || str === "8") return `قيد الانتظار`;
    if (str === "10") return `تم الفحص`;
    if (str === "11") return `مرتجع للمورد`;
    if (str === "99") return `غير نشط`;
    return String(status).trim();
  };

  const getDyeStatusText = (status: string | number | undefined | null) => {
    const str = status != null ? String(status).trim().toUpperCase() : "";
    if (!str || str === "NULL") return `تحت الفحص`;

    if (str === "00" || str === "0") return `نشط`;
    if (str === "01" || str === "1") return `جديد`;
    if (str === "02" || str === "2") return `مؤكد`;
    if (str === "03" || str === "3") return `مغلق`;
    if (str === "04" || str === "4") return `مقبول`;
    if (str === "05" || str === "5") return `مرفوض`;
    if (str === "06" || str === "6") return `محول`;
    if (str === "07" || str === "7") return `تحت المعالجة`;
    if (str === "08" || str === "8") return `قيد الانتظار`;
    if (str === "10") return `تم الفحص`;
    if (str === "11") return `إعادة تشغيل`;
    if (str === "45") return `مرفوض - مستثنى`;
    if (str === "99") return `غير نشط`;
    return String(status).trim();
  };

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
  const margin = 16;
  const pageWidth = doc.internal.pageSize.getWidth();
  const rightEdge = pageWidth - margin;

  const logo = new Image();
  logo.src = "/logo.png";
  await new Promise((resolve) => {
    logo.onload = resolve;
  });
  // Logo (Top Right)
  doc.addImage(logo, "PNG", pageWidth - margin - 45, 5, 45, 25);

  // ── Barcode Image (Top Left) ──
  if (row.ROLL_BARCODE) {
    try {
      const JsBarcode = (await import("jsbarcode")).default;
      const canvas = document.createElement("canvas");
      JsBarcode(canvas, String(row.ROLL_BARCODE), {
        format: "CODE128",
        displayValue: true,
        fontSize: 14,
        height: 45,
        margin: 0,
      });
      const barcodeDataUrl = canvas.toDataURL("image/png");
      doc.addImage(barcodeDataUrl, "PNG", margin, 8, 70, 22);
    } catch (err) {
      console.error("Barcode generation failed", err);
    }
  }

  doc.setFont("Amiri", "normal");
  doc.setFontSize(22);
  doc.text("تقرير فحص التوب", rightEdge, 35, { align: "right" });

  doc.setFontSize(11);
  const labelCol1 = rightEdge;
  const valCol1 = rightEdge - 25;
  const labelCol2 = rightEdge - 85;
  const valCol2 = rightEdge - 110;

  // Column 1 (Right)
  doc.text("امر التشغيل", labelCol1, 45, { align: "right" });
  doc.text(String(row.WO_NO ?? ""), valCol1, 45, { align: "right" });

  doc.text("اللون", labelCol1, 52, { align: "right" });
  doc.text(String(row.COLOR_DESC ?? ""), valCol1, 52, { align: "right" });

  doc.text("التاريخ", labelCol1, 59, { align: "right" });
  doc.text(new Date().toLocaleString("en-US"), valCol1, 59, { align: "right" });

  // Column 2 (Middle)
  doc.text("الحوض", labelCol2, 45, { align: "right" });
  doc.text(String(row.JO_NO ?? ""), valCol2, 45, { align: "right" });

  doc.text("كود اللون", labelCol2, 52, { align: "right" });
  doc.text(String(row.COLOR_CODE ?? ""), valCol2, 52, { align: "right" });

  doc.text("الوزن الصافي", labelCol2, 59, { align: "right" });
  const net = (Number(row.QTY_02) || 0) + (Number(row.QTY_04) || 0);
  doc.text(net.toFixed(2), valCol2, 59, { align: "right" });

  doc.text("الوزن القائم", labelCol1, 66, { align: "right" });
  const gross = (Number(row.QTY_05) || 0) + (Number(row.QTY_06) || 0);
  doc.text(gross.toFixed(2), valCol1, 66, { align: "right" });

  // ── KNT Table ──+
  doc.setFontSize(14);
  doc.setFont("Amiri", "normal");
  doc.text("النسيج", rightEdge, 75, { align: "right" });

  doc.setFontSize(12);
  doc.text(getKntStatusText(row.KNT_DOC_STATUS), rightEdge - 11, 75, {
    align: "right",
  });

  autoTable(doc, {
    startY: 79,
    head: [["القيمة", "الوصف", "القيمة", "الوصف"]],
    body: buildGridBody(kntFields),
    theme: "grid",
    rtl: true,
    styles: { font: "Amiri", fontStyle: "normal", halign: "right" },
    headStyles: {
      fillColor: [39, 174, 96],
      font: "Amiri",
      fontStyle: "normal",
      halign: "right",
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 45 },
      2: { cellWidth: 45 },
      3: { cellWidth: 45 },
    },
  } as any);

  // ── DYE Table ──
  const dyeY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(14);
  doc.setFont("Amiri", "normal");
  doc.text("الصباغة", rightEdge, dyeY, { align: "right" });

  doc.setFontSize(12);
  doc.text(getDyeStatusText(row.DYE_DOC_STATUS), rightEdge - 13, dyeY, {
    align: "right",
  });

  autoTable(doc, {
    startY: dyeY + 4,
    head: [["القيمة", "الوصف", "القيمة", "الوصف"]],
    body: buildGridBody(dyeFields),
    theme: "grid",
    rtl: true,
    styles: { font: "Amiri", fontStyle: "normal", halign: "right" },
    headStyles: {
      fillColor: [41, 128, 185],
      font: "Amiri",
      fontStyle: "normal",
      halign: "right",
    },
    columnStyles: {
      0: { cellWidth: 45 },
      1: { cellWidth: 45 },
      2: { cellWidth: 45 },
      3: { cellWidth: 45 },
    },
  } as any);

  doc.save(`${row.ROLL_BARCODE}.pdf`);
}
