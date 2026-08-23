import { jsPDF } from "jspdf";
import type { PinjamanAset } from "@/components/PinjamanAsetCard";

const PAGE_W = 210;
const MARGIN_L = 16;
const MARGIN_R = 194;

function fmtTarikh(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ms-MY");
}

function fmtTarikhKelulusan(record: PinjamanAset) {
  if (record.status === "DITOLAK") {
    return record.tarikhDitolak ? `${fmtTarikh(record.tarikhDitolak)} (Tidak Lulus)` : "";
  }
  return record.tarikhLulus ? `${fmtTarikh(record.tarikhLulus)} (Lulus)` : "";
}

// Pelulus (Pegawai Aset) and Pengeluar on the printed KEW.PA-9 always reflect the designated
// officers for this process, not whichever staff account actually clicked "Luluskan" in the
// system — that real approver identity still stays on the record for internal audit purposes.
const PELULUS_NAMA_TETAP = "Azimah Bt Adnan";
const PELULUS_JAWATAN_TETAP = "Pengurus Kanan";
const PENGELUAR_NAMA_TETAP = "Mohd Hykal B Mohd Halim";
const PENGELUAR_JAWATAN_TETAP = "Penolong Pegawai";

export function generateKewPa9(record: PinjamanAset) {
  const isApproved = !!record.tarikhLulus;
  const pelulusNamaFixed = isApproved ? PELULUS_NAMA_TETAP : "";
  const pelulusJawatanFixed = isApproved ? PELULUS_JAWATAN_TETAP : "";
  const pengeluarNamaFixed = isApproved ? PENGELUAR_NAMA_TETAP : "";
  const pengeluarJawatanFixed = isApproved ? PENGELUAR_JAWATAN_TETAP : "";

  const isDiterima = !!record.tarikhDiterima;
  const penerimaNamaFixed = isDiterima ? PENGELUAR_NAMA_TETAP : "";
  const penerimaJawatanFixed = isDiterima ? PENGELUAR_JAWATAN_TETAP : "";

  const doc = new jsPDF();
  let y = 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Pekeliling Perbendaharaan Malaysia AM 2.4 Lampiran A", MARGIN_L, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("KEW.PA-9", MARGIN_R, y, { align: "right" });
  y += 10;
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.text(`No. Permohonan : ${record.id.slice(-8).toUpperCase()}`, MARGIN_R, y, { align: "right" });
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("BORANG PERMOHONAN PERGERAKAN/ PINJAMAN ASET ALIH", PAGE_W / 2, y, { align: "center", maxWidth: MARGIN_R - MARGIN_L });
  y += 14;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const colGap = (MARGIN_R - MARGIN_L) / 2;
  function field(label: string, value: string, col: 0 | 1, row: number) {
    const x = MARGIN_L + col * colGap;
    const rowY = y + row * 9;
    doc.text(`${label} :`, x, rowY);
    doc.text(value, x + 32, rowY);
    doc.line(x + 31, rowY + 1, x + colGap - 4, rowY + 1);
  }
  field("Nama Pemohon", record.pemohon.name, 0, 0);
  field("Tujuan", record.tujuan, 1, 0);
  field("Jawatan", record.jawatan, 0, 1);
  field("Tempat Digunakan", record.tempatDigunakan, 1, 1);
  field("Bahagian", record.bahagian, 0, 2);
  field("Nama Pengeluar", pengeluarNamaFixed, 1, 2);
  field("Jawatan", pengeluarJawatanFixed, 1, 3);
  y += 4 * 9 + 8;

  const cols = [
    { label: "BIL", w: 8 },
    { label: "NO. SIRI PENDAFTARAN", w: 30 },
    { label: "KETERANGAN ASET", w: 32 },
    { label: "TARIKH (LULUS/ TIDAK LULUS)", w: 26 },
    { label: "DIPINJAM", w: 16 },
    { label: "DIJANGKA PULANG", w: 16 },
    { label: "DIPULANGKAN", w: 16 },
    { label: "DITERIMA", w: 16 },
    { label: "CATATAN", w: 18 },
  ];
  const colX: number[] = [];
  let acc = MARGIN_L;
  for (const c of cols) {
    colX.push(acc);
    acc += c.w;
  }

  const headH = 14;
  doc.setFillColor(217, 217, 217);
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.3);
  doc.rect(MARGIN_L, y, MARGIN_R - MARGIN_L, headH, "FD");
  colX.slice(1).forEach((x) => doc.line(x, y, x, y + headH));
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.3);
  cols.forEach((c, i) => {
    const lines = doc.splitTextToSize(c.label, c.w - 2);
    doc.text(lines, colX[i] + c.w / 2, y + headH / 2 - (lines.length - 1) * 1.4, { align: "center" });
  });
  y += headH;

  const rowH = 9;
  const kelulusanText = fmtTarikhKelulusan(record);
  const dateVals = [
    fmtTarikh(record.tarikhDipinjam),
    fmtTarikh(record.tarikhDijangkaPulang),
    fmtTarikh(record.tarikhDipulangkan),
    fmtTarikh(record.tarikhDiterima),
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  record.items.forEach((it, i) => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.rect(MARGIN_L, y, MARGIN_R - MARGIN_L, rowH);
    colX.slice(1).forEach((x) => doc.line(x, y, x, y + rowH));

    const nama = doc.splitTextToSize(it.aset.namaAset, cols[2].w - 2)[0] || it.aset.namaAset;
    doc.text(String(i + 1), colX[0] + cols[0].w / 2, y + rowH / 2 + 1.3, { align: "center" });
    doc.text(it.aset.noPendaftaran || "-", colX[1] + 1.5, y + rowH / 2 + 1.3);
    doc.text(nama, colX[2] + 1.5, y + rowH / 2 + 1.3);
    if (kelulusanText) {
      const lines = doc.splitTextToSize(kelulusanText, cols[3].w - 2);
      doc.setFontSize(6.5);
      doc.text(lines, colX[3] + cols[3].w / 2, y + rowH / 2 + 1.3 - (lines.length - 1) * 1.6, { align: "center" });
      doc.setFontSize(7.5);
    }
    dateVals.forEach((v, di) => {
      doc.text(v, colX[4 + di] + cols[4 + di].w / 2, y + rowH / 2 + 1.3, { align: "center" });
    });
    y += rowH;
  });

  y += 16;
  const sigW = (MARGIN_R - MARGIN_L - 12) / 2;
  const sigs = [
    { title: "(Tandatangan Peminjam)", nama: record.pemohon.name, jawatan: record.jawatan, jawatanLabel: "Jawatan", tarikh: fmtTarikh(record.createdAt) },
    { title: "(Tandatangan Pelulus)", nama: pelulusNamaFixed, jawatan: pelulusJawatanFixed, jawatanLabel: "Pelulus (Pegawai Aset)", tarikh: fmtTarikh(record.tarikhLulus) },
    { title: "(Tandatangan Pemulang)", nama: record.pemulangNama ?? "", jawatan: record.pemulangJawatan ?? "", jawatanLabel: "Jawatan", tarikh: fmtTarikh(record.tarikhDipulangkan) },
    { title: "(Tandatangan Penerima)", nama: penerimaNamaFixed, jawatan: penerimaJawatanFixed, jawatanLabel: "Jawatan", tarikh: fmtTarikh(record.tarikhDiterima) },
  ];

  sigs.forEach((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = MARGIN_L + col * (sigW + 12);
    const sy = y + row * 34;
    doc.setFontSize(9.5);
    doc.text("……………………………………………", x, sy);
    doc.text(s.title, x, sy + 5);
    doc.text(`Nama : ${s.nama}`, x, sy + 12);
    doc.text(`${s.jawatanLabel} : ${s.jawatan}`, x, sy + 17);
    doc.text(`Tarikh : ${s.tarikh}`, x, sy + 22);
  });

  doc.save(`KEW-PA-9-Pinjaman-Aset-${record.id.slice(-8)}.pdf`);
}
