import { jsPDF } from "jspdf";

type Aset = { id: string; namaAset: string; noPendaftaran: string; tahun: string | null; lokasi: string; status: string };

const PAGE_W = 210;
const MARGIN_L = 16;
const MARGIN_R = 194;
const PAGE_BOTTOM = 285;
const BAHAGIAN_DEFAULT = "Perbadanan Produktiviti Malaysia (MPC) Wilayah Selatan";

function drawSignatureFooter(doc: jsPDF, y: number) {
  if (y > PAGE_BOTTOM - 35) {
    doc.addPage();
    y = 25;
  }
  const leftX = MARGIN_L;
  const rightX = PAGE_W / 2 + 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text("(a) Disediakan oleh :", leftX, y);
  doc.text("(b) Disahkan oleh :", rightX, y);
  y += 18;
  doc.text("……………………………………", leftX, y);
  doc.text("……………………………………", rightX, y);
  y += 5;
  doc.setFontSize(9);
  doc.text("Tandatangan", leftX + 20, y, { align: "center" });
  doc.text("Tandatangan", rightX + 20, y, { align: "center" });
  y += 8;
  doc.setFontSize(9.5);
  doc.text("Nama       :", leftX, y);
  doc.text("Nama       :", rightX, y);
  y += 6;
  doc.text("Jawatan    :", leftX, y);
  doc.text("Jawatan    :", rightX, y);
  y += 6;
  doc.text("Tarikh      :", leftX, y);
  doc.text("Tarikh      :", rightX, y);
}

function drawKewPa7Page(doc: jsPDF, bahagian: string, lokasi: string, items: Aset[]) {
  let y = 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("KEW.PA-7", MARGIN_R, y, { align: "right" });
  y += 14;
  doc.setFontSize(14);
  doc.text("SENARAI ASET ALIH", PAGE_W / 2, y, { align: "center" });
  y += 14;

  doc.setFontSize(10.5);
  doc.setFont("helvetica", "normal");
  doc.text("BAHAGIAN :", MARGIN_L + 14, y);
  doc.text(bahagian, MARGIN_L + 40, y);
  doc.line(MARGIN_L + 39, y + 1, MARGIN_R, y + 1);
  y += 7;
  doc.text("LOKASI", MARGIN_L + 14, y);
  doc.text(":", MARGIN_L + 33, y);
  doc.text(lokasi, MARGIN_L + 40, y);
  doc.line(MARGIN_L + 39, y + 1, MARGIN_R, y + 1);
  y += 10;

  const colX = [MARGIN_L, MARGIN_L + 16, MARGIN_L + 116, MARGIN_R - 20];
  const colW = [16, 100, 62, 20];
  const rowH = 7;

  function drawHead() {
    doc.setFillColor(217, 217, 217);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(colX[0], y, MARGIN_R - MARGIN_L, rowH, "FD");
    doc.line(colX[1], y, colX[1], y + rowH);
    doc.line(colX[2], y, colX[2], y + rowH);
    doc.line(colX[3], y, colX[3], y + rowH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("BIL", colX[0] + colW[0] / 2, y + rowH / 2 + 1.5, { align: "center" });
    doc.text("NO SIRI PENDAFTARAN", colX[1] + colW[1] / 2, y + rowH / 2 + 1.5, { align: "center" });
    doc.text("KETERANGAN ASET", colX[2] + colW[2] / 2, y + rowH / 2 + 1.5, { align: "center" });
    doc.text("KUANTITI", colX[3] + colW[3] / 2, y + rowH / 2 + 1.5, { align: "center" });
    doc.setFont("helvetica", "normal");
    y += rowH;
  }

  drawHead();

  const minRows = Math.max(items.length, 11);

  for (let i = 0; i < minRows; i++) {
    if (y + rowH > PAGE_BOTTOM - 45) {
      doc.addPage();
      y = 18;
      drawHead();
    }
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.rect(colX[0], y, MARGIN_R - MARGIN_L, rowH);
    doc.line(colX[1], y, colX[1], y + rowH);
    doc.line(colX[2], y, colX[2], y + rowH);
    doc.line(colX[3], y, colX[3], y + rowH);

    doc.setFontSize(8.5);
    doc.text(String(i + 1), colX[0] + colW[0] / 2, y + rowH / 2 + 1.5, { align: "center" });
    const item = items[i];
    if (item) {
      const nama = doc.splitTextToSize(item.namaAset, colW[2] - 4)[0] || item.namaAset;
      doc.text(item.noPendaftaran || "-", colX[1] + 2, y + rowH / 2 + 1.5);
      doc.text(nama, colX[2] + 2, y + rowH / 2 + 1.5);
      doc.text("1", colX[3] + colW[3] / 2, y + rowH / 2 + 1.5, { align: "center" });
    }
    y += rowH;
  }

  y += 14;
  drawSignatureFooter(doc, y);
}

export function generateKewPa7(lokasiList: string[], records: Aset[], bahagian: string = BAHAGIAN_DEFAULT) {
  const doc = new jsPDF();
  let first = true;
  for (const lokasi of lokasiList) {
    const items = records.filter((r) => r.lokasi === lokasi);
    if (items.length === 0) continue;
    if (!first) doc.addPage();
    first = false;
    drawKewPa7Page(doc, bahagian, lokasi, items);
  }
  doc.save("KEW-PA-7-Senarai-Aset.pdf");
}

export function generateKewPa14(items: Aset[], scopeLabel: string, bahagian: string = BAHAGIAN_DEFAULT) {
  const doc = new jsPDF();
  let y = 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("KEW.PA-14", MARGIN_R, y, { align: "right" });
  y += 14;
  doc.setFontSize(13.5);
  doc.text("SENARAI ASET ALIH YANG MEMERLUKAN PENYELENGGARAAN", PAGE_W / 2, y, { align: "center", maxWidth: MARGIN_R - MARGIN_L });
  y += 14;

  doc.setFontSize(10.5);
  doc.setFont("helvetica", "normal");
  doc.text("BAHAGIAN :", MARGIN_L + 14, y);
  doc.text(bahagian, MARGIN_L + 40, y);
  doc.line(MARGIN_L + 39, y + 1, MARGIN_R, y + 1);
  y += 7;
  doc.text("LOKASI", MARGIN_L + 14, y);
  doc.text(":", MARGIN_L + 33, y);
  doc.text(scopeLabel, MARGIN_L + 40, y);
  doc.line(MARGIN_L + 39, y + 1, MARGIN_R, y + 1);
  y += 10;

  const colX = [MARGIN_L, MARGIN_L + 14, MARGIN_L + 96, MARGIN_L + 140, MARGIN_R - 24];
  const colW = [14, 82, 44, 44, 24];
  const rowH = 7;

  function drawHead() {
    doc.setFillColor(217, 217, 217);
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.rect(colX[0], y, MARGIN_R - MARGIN_L, rowH, "FD");
    for (let i = 1; i < colX.length; i++) doc.line(colX[i], y, colX[i], y + rowH);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text("BIL", colX[0] + colW[0] / 2, y + rowH / 2 + 1.5, { align: "center" });
    doc.text("NAMA ASET", colX[1] + colW[1] / 2, y + rowH / 2 + 1.5, { align: "center" });
    doc.text("NO. PENDAFTARAN", colX[2] + colW[2] / 2, y + rowH / 2 + 1.5, { align: "center" });
    doc.text("LOKASI", colX[3] + colW[3] / 2, y + rowH / 2 + 1.5, { align: "center" });
    doc.text("CATATAN", colX[4] + colW[4] / 2, y + rowH / 2 + 1.5, { align: "center" });
    doc.setFont("helvetica", "normal");
    y += rowH;
  }

  drawHead();

  if (items.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("Tiada aset berstatus rosak untuk skop ini.", colX[0] + 2, y + 5);
    y += 9;
  }

  items.forEach((item, i) => {
    if (y + rowH > PAGE_BOTTOM - 45) {
      doc.addPage();
      y = 18;
      drawHead();
    }
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.rect(colX[0], y, MARGIN_R - MARGIN_L, rowH);
    for (let c = 1; c < colX.length; c++) doc.line(colX[c], y, colX[c], y + rowH);

    doc.setFontSize(8);
    const nama = doc.splitTextToSize(item.namaAset, colW[1] - 4)[0] || item.namaAset;
    const lokasi = doc.splitTextToSize(item.lokasi, colW[3] - 4)[0] || item.lokasi;
    doc.text(String(i + 1), colX[0] + colW[0] / 2, y + rowH / 2 + 1.5, { align: "center" });
    doc.text(nama, colX[1] + 2, y + rowH / 2 + 1.5);
    doc.text(item.noPendaftaran || "-", colX[2] + 2, y + rowH / 2 + 1.5);
    doc.text(lokasi, colX[3] + 2, y + rowH / 2 + 1.5);
    doc.text("Rosak", colX[4] + colW[4] / 2, y + rowH / 2 + 1.5, { align: "center" });
    y += rowH;
  });

  y += 14;
  drawSignatureFooter(doc, y);

  doc.save("KEW-PA-14-Perlu-Penyelenggaraan.pdf");
}
