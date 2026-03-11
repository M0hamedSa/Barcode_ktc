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
  // Logo (Top Right) - Smaller
  doc.addImage(logo, "PNG", pageWidth - margin - 35, 5, 35, 18);

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
      doc.addImage(barcodeDataUrl, "PNG", margin, 5, 55, 15);
    } catch (err) {
      console.error("Barcode generation failed", err);
    }
  }

  doc.setFont("Amiri", "normal");
  doc.setFontSize(16);
  doc.text("تقرير فحص التوب", rightEdge, 28, { align: "right" });

  doc.setFontSize(9);
  const labelCol1 = rightEdge;
  const valCol1 = rightEdge - 20;
  const labelCol2 = rightEdge - 65;
  const valCol2 = rightEdge - 85;
  const labelCol3 = rightEdge - 130;
  const valCol3 = rightEdge - 150;

  // Row 1
  doc.text("امر التشغيل", labelCol1, 35, { align: "right" });
  doc.text(String(row.WO_NO ?? ""), valCol1, 35, { align: "right" });

  doc.text("الحوض", labelCol2, 35, { align: "right" });
  doc.text(String(row.JO_NO ?? ""), valCol2, 35, { align: "right" });

  doc.text("التاريخ", labelCol3, 35, { align: "right" });
  doc.text(new Date().toLocaleDateString("en-GB"), valCol3, 35, {
    align: "right",
  });

  // Row 2
  doc.text("اللون", labelCol1, 41, { align: "right" });
  doc.text(String(row.COLOR_DESC ?? ""), valCol1, 41, { align: "right" });

  doc.text("كود اللون", labelCol2, 41, { align: "right" });
  doc.text(String(row.COLOR_CODE ?? ""), valCol2, 41, { align: "right" });

  doc.text("الوزن", labelCol3, 41, { align: "right" });

  doc.text(String(row.ROll_WEIGHT ?? ""), valCol3, 41, { align: "right" });

  // ── KNT Table ──
  doc.setFontSize(11);
  doc.setFont("Amiri", "normal");
  doc.text("النسيج", rightEdge, 50, { align: "right" });

  doc.setFontSize(11);
  doc.text(getKntStatusText(row.KNT_DOC_STATUS), rightEdge - 10, 50, {
    align: "right",
  });

  autoTable(doc, {
    startY: 58,
    head: [["القيمة", "الوصف", "القيمة", "الوصف"]],
    body: buildGridBody(kntFields),
    theme: "grid",
    rtl: true,
    styles: {
      font: "Amiri",
      fontStyle: "normal",
      halign: "right",
      fontSize: 9.5,
      cellPadding: 2.0,
    },
    headStyles: {
      fillColor: [39, 174, 96],
      font: "Amiri",
      fontStyle: "normal",
      halign: "right",
      fontSize: 9.5,
    },
    columnStyles: {
      0: { cellWidth: 46 },
      1: { cellWidth: 46 },
      2: { cellWidth: 46 },
      3: { cellWidth: 46 },
    },
  } as any);

  // ── DYE Table ──
  const dyeY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(11);
  doc.setFont("Amiri", "normal");
  doc.text("الصباغة", rightEdge, dyeY, { align: "right" });

  doc.setFontSize(11);
  doc.text(getDyeStatusText(row.DYE_DOC_STATUS), rightEdge - 11, dyeY, {
    align: "right",
  });

  autoTable(doc, {
    startY: dyeY + 8,
    head: [["القيمة", "الوصف", "القيمة", "الوصف"]],
    body: buildGridBody(dyeFields),
    theme: "grid",
    rtl: true,
    styles: {
      font: "Amiri",
      fontStyle: "normal",
      halign: "right",
      fontSize: 9.5,
      cellPadding: 2.0,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      font: "Amiri",
      fontStyle: "normal",
      halign: "right",
      fontSize: 9.5,
    },
    columnStyles: {
      0: { cellWidth: 46 },
      1: { cellWidth: 46 },
      2: { cellWidth: 46 },
      3: { cellWidth: 46 },
    },
  } as any);

  doc.save(
    `(${row.ROLL_BARCODE})_${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}
