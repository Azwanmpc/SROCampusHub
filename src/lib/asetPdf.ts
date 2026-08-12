import { jsPDF } from "jspdf";

type Aset = { id: string; namaAset: string; noPendaftaran: string; tahun: string | null; lokasi: string; status: string };
type LokasiSummary = { jumlah: number; baik: number; rosak: number };

const PAGE_W = 210;
const MARGIN_L = 16;
const MARGIN_R = 194;
const PAGE_BOTTOM = 285;

function tarikhSekarang() {
  return new Date().toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric" });
}

function drawHeader(doc: jsPDF, kod: string, tajuk: string) {
  let y = 16;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(kod, MARGIN_R, y, { align: "right" });
  doc.setFontSize(13);
  doc.text("PERBADANAN PRODUKTIVITI MALAYSIA", PAGE_W / 2, y, { align: "center" });
  y += 6;
  doc.setFontSize(10);
  doc.text("WILAYAH SELATAN", PAGE_W / 2, y, { align: "center" });
  y += 8;
  doc.setFontSize(12.5);
  doc.text(tajuk, PAGE_W / 2, y, { align: "center" });
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Tarikh dijana: ${tarikhSekarang()}`, PAGE_W / 2, y, { align: "center" });
  y += 6;
  doc.setLineWidth(0.5);
  doc.line(MARGIN_L, y, MARGIN_R, y);
  return y + 8;
}

function drawTableHead(doc: jsPDF, y: number, cols: { label: string; x: number }[]) {
  doc.setFillColor(26, 26, 26);
  doc.rect(MARGIN_L, y - 5, MARGIN_R - MARGIN_L, 7, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  cols.forEach((c) => doc.text(c.label, c.x, y));
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  return y + 6;
}

function ensureSpace(doc: jsPDF, y: number, needed: number, cols: { label: string; x: number }[], redraw: boolean) {
  if (y + needed > PAGE_BOTTOM) {
    doc.addPage();
    let ny = 16;
    if (redraw) ny = drawTableHead(doc, ny + 5, cols);
    return ny;
  }
  return y;
}

const BAHAGIAN_DEFAULT = "Perbadanan Produktiviti Malaysia (MPC) Wilayah Selatan";

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

  const rowsPerPage = Math.max(1, Math.floor((PAGE_BOTTOM - 55 - y) / rowH));
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
  void rowsPerPage;

  y += 14;
  if (y > PAGE_BOTTOM - 35) {
    doc.addPage();
    y = 25;
  }

  const leftX = MARGIN_L;
  const rightX = PAGE_W / 2 + 6;
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

export function generateKewPa8(byLokasi: Map<string, LokasiSummary>) {
  const doc = new jsPDF();
  let y = drawHeader(doc, "KEW.PA-8", "KEDUDUKAN ASET ALIH");

  const cols = [
    { label: "BIL", x: MARGIN_L + 1 },
    { label: "LOKASI", x: MARGIN_L + 12 },
    { label: "JUMLAH ASET", x: MARGIN_L + 110 },
    { label: "BAIK", x: MARGIN_L + 140 },
    { label: "ROSAK", x: MARGIN_L + 160 },
  ];
  y = drawTableHead(doc, y, cols);
  doc.setFontSize(8.5);

  const rows = Array.from(byLokasi.entries()).sort((a, b) => b[1].jumlah - a[1].jumlah);
  let totalJumlah = 0,
    totalBaik = 0,
    totalRosak = 0;

  rows.forEach(([lokasi, v], i) => {
    y = ensureSpace(doc, y, 6, cols, true);
    doc.text(String(i + 1), cols[0].x, y);
    doc.text(lokasi, cols[1].x, y);
    doc.text(String(v.jumlah), cols[2].x, y);
    doc.text(String(v.baik), cols[3].x, y);
    doc.text(String(v.rosak), cols[4].x, y);
    y += 5.5;
    totalJumlah += v.jumlah;
    totalBaik += v.baik;
    totalRosak += v.rosak;
  });

  y = ensureSpace(doc, y, 8, cols, false);
  y += 2;
  doc.setLineWidth(0.4);
  doc.line(MARGIN_L, y, MARGIN_R, y);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("JUMLAH KESELURUHAN", cols[1].x, y);
  doc.text(String(totalJumlah), cols[2].x, y);
  doc.text(String(totalBaik), cols[3].x, y);
  doc.text(String(totalRosak), cols[4].x, y);

  doc.save("KEW-PA-8-Kedudukan-Aset.pdf");
}

export function generateKewPa14(rosakRecords: Aset[]) {
  const doc = new jsPDF();
  let y = drawHeader(doc, "KEW.PA-14", "SENARAI ASET ALIH YANG MEMERLUKAN PENYELENGGARAAN");

  const cols = [
    { label: "BIL", x: MARGIN_L + 1 },
    { label: "NAMA ASET", x: MARGIN_L + 12 },
    { label: "NO. PENDAFTARAN", x: MARGIN_L + 90 },
    { label: "LOKASI", x: MARGIN_L + 140 },
    { label: "CATATAN", x: MARGIN_L + 172 },
  ];
  y = drawTableHead(doc, y, cols);
  doc.setFontSize(8);

  if (rosakRecords.length === 0) {
    doc.setFont("helvetica", "italic");
    doc.text("Tiada aset berstatus rosak pada masa ini.", MARGIN_L, y + 2);
  }

  rosakRecords.forEach((item, i) => {
    y = ensureSpace(doc, y, 6, cols, true);
    const nama = doc.splitTextToSize(item.namaAset, 75)[0] || item.namaAset;
    const lokasi = doc.splitTextToSize(item.lokasi, 30)[0] || item.lokasi;
    doc.text(String(i + 1), cols[0].x, y);
    doc.text(nama, cols[1].x, y);
    doc.text(item.noPendaftaran || "-", cols[2].x, y);
    doc.text(lokasi, cols[3].x, y);
    doc.text("Rosak", cols[4].x, y);
    y += 5.5;
  });

  doc.save("KEW-PA-14-Perlu-Penyelenggaraan.pdf");
}
