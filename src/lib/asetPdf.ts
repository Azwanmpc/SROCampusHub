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

export function generateKewPa7(lokasiList: string[], records: Aset[]) {
  const doc = new jsPDF();
  let y = drawHeader(doc, "KEW.PA-7", "SENARAI ASET ALIH MENGIKUT LOKASI");

  const cols = [
    { label: "BIL", x: MARGIN_L + 1 },
    { label: "NAMA ASET", x: MARGIN_L + 12 },
    { label: "NO. PENDAFTARAN", x: MARGIN_L + 105 },
    { label: "TAHUN", x: MARGIN_L + 155 },
    { label: "STATUS", x: MARGIN_L + 175 },
  ];

  for (const lokasi of lokasiList) {
    const items = records.filter((r) => r.lokasi === lokasi);
    if (items.length === 0) continue;

    if (y > PAGE_BOTTOM - 20) {
      doc.addPage();
      y = 16;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(`Lokasi: ${lokasi}`, MARGIN_L, y);
    y += 3;
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(`(${items.length} aset)`, MARGIN_L, y + 4);
    y += 8;

    y = drawTableHead(doc, y, cols);
    doc.setFontSize(8);

    items.forEach((item, i) => {
      y = ensureSpace(doc, y, 6, cols, true);
      const nama = doc.splitTextToSize(item.namaAset, 90)[0] || item.namaAset;
      doc.text(String(i + 1), cols[0].x, y);
      doc.text(nama, cols[1].x, y);
      doc.text(item.noPendaftaran || "-", cols[2].x, y);
      doc.text(item.tahun || "-", cols[3].x, y);
      doc.text(item.status === "ROSAK" ? "Rosak" : "Baik", cols[4].x, y);
      y += 5.5;
    });
    y += 8;
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
