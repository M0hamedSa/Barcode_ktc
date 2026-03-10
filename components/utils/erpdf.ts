export async function exportErpPdf(rows: any[]) {
  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("ERP Roll Report", 14, 18);

  doc.setFontSize(11);
  doc.text(`Date: ${new Date().toLocaleString()}`, 14, 26);

  const body = rows.map((r) => [r.ROLL_BARCODE, r.ROLL_NO, r.JO_NO, r.WO_NO]);

  autoTable(doc, {
    startY: 32,
    head: [["Barcode", "Roll No", "JO No", "WO No"]],
    body,
    theme: "grid",
  });

  doc.save("erp_roll_report.pdf");
}
