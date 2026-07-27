import { jsPDF } from "jspdf";

function fmtRM(n: number) {
  return "RM " + Number(n).toLocaleString("en-MY");
}

export type QuotationBooking = {
  id: string;
  facilitiesLabel: string;
  tujuan: string;
  tarikh: string;
  peserta: number;
  pemohon: string;
  sebutTel: string;
  sebutOrganisasi: string;
  kos: number;
  finalPrice: number;
  itemsBreakdown: { nama: string; rateLabel: string; price: number }[];
  addonsBreakdown: { label: string; rateTypeLabel: string; qty: number; price: number }[];
  noSebutharga: string;
  tarikhSebutharga: string;
};

export async function generateQuotationPdf(b: QuotationBooking) {
  const doc = new jsPDF();
  const pageW = 210,
    marginL = 20,
    marginR = 190;
  let y = 22;

  const letterheadImg = await loadImage("/assets/mpc-letterhead.png");
  if (letterheadImg) {
    const imgW = pageW - marginL * 2;
    const imgH = imgW * (letterheadImg.height / letterheadImg.width);
    doc.addImage(letterheadImg, "PNG", marginL, y, imgW, imgH);
    y += imgH + 4;
    doc.setLineWidth(0.6);
    doc.line(marginL, y, marginR, y);
    y += 10;
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("PERBADANAN PRODUKTIVITI MALAYSIA WILAYAH SELATAN", pageW / 2, y, { align: "center" });
    y += 14;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text("Bil(" + b.noSebutharga + ")        " + b.tarikhSebutharga, marginL, y);
  y += 10;
  doc.text(b.sebutOrganisasi || b.pemohon || "—", marginL, y);
  y += 6;
  doc.text("Tel: " + (b.sebutTel || "—"), marginL, y);
  y += 6;
  doc.text("(U/p : " + (b.pemohon || "—") + ")", marginL, y);
  y += 10;
  doc.text("Tuan,", marginL, y);
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Sebutharga Sewa Kemudahan Di MPC Wilayah Selatan.", marginL, y);
  y += 9;
  doc.setFont("helvetica", "normal");

  const paras = [
    "Dengan segala hormatnya merujuk perkara di atas.",
    "Bersama-sama ini disertakan kadar bayaran yang dikenakan (Lampiran 1) dan Syarat-syarat Pengesahan Tempahan Kemudahan Pejabat MPC Wilayah Selatan (Lampiran 2) untuk tindakan Tuan.",
    "Sila sahkan tempahan Tuan dengan menandatangani dan mengembalikan surat setuju (Lampiran 3) selewat-lewatnya 7 hari dari tarikh surat ini.",
    "Perbadanan Produktiviti Malaysia (MPC) Pejabat Wilayah Selatan mengalu-alukan kedatangan pihak Tuan bersama peserta-peserta program ke kompleks kami. Kami berharap agar pihak Tuan berpuas hati dengan perkhidmatan yang kami berikan.",
    "Sekian, terima kasih.",
  ];
  paras.forEach((p) => {
    const lines = doc.splitTextToSize(p, marginR - marginL);
    doc.text(lines, marginL, y);
    y += lines.length * 5.5 + 3;
  });
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text('"BERKHIDMAT UNTUK NEGARA"', marginL, y);
  y += 6;
  doc.text('"MEMACU PRODUKTIVITI NEGARA"', marginL, y);
  y += 14;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text("Saya yang menurut perintah,", marginL, y);
  y += 14;
  doc.setFont("helvetica", "bold");
  doc.text("Mohd Hykal Mohd Halim", marginL, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.text("b.p Pengarah", marginL, y);
  y += 6;
  doc.text("Perbadanan Produktiviti Malaysia (MPC) Wilayah Selatan", marginL, y);

  doc.addPage();
  y = 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Lampiran 1", pageW / 2, y, { align: "center" });
  y += 8;
  doc.setFontSize(14);
  doc.text("KADAR HARGA", pageW / 2, y, { align: "center" });
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.text("Program: " + (b.tujuan || "—"), marginL, y);
  y += 6;
  doc.text("Tarikh: " + (b.tarikh || "—") + "   Jumlah: " + (b.peserta || "—") + " Pax", marginL, y);
  y += 10;
  doc.setFont("helvetica", "bold");
  doc.text("Butiran Fasiliti", marginL, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  b.itemsBreakdown.forEach((it) => {
    doc.text(it.nama + " (" + it.rateLabel + ")", marginL, y);
    doc.text(fmtRM(it.price), marginR, y, { align: "right" });
    y += 6;
  });
  (b.addonsBreakdown || []).forEach((a) => {
    doc.text(a.label + " (Add-on) " + a.rateTypeLabel + " x" + a.qty, marginL, y);
    doc.text(fmtRM(a.price), marginR, y, { align: "right" });
    y += 6;
  });
  y += 4;
  doc.line(marginL, y, marginR, y);
  y += 8;
  doc.text("Anggaran Asal", marginL, y);
  doc.text(fmtRM(b.kos), marginR, y, { align: "right" });
  y += 7;
  const diskaun = b.kos - b.finalPrice;
  if (diskaun > 0) {
    doc.text("Diskaun Diberikan", marginL, y);
    doc.text(fmtRM(diskaun), marginR, y, { align: "right" });
    y += 7;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Jumlah Akhir", marginL, y);
  doc.text(fmtRM(b.finalPrice), marginR, y, { align: "right" });

  doc.addPage();
  y = 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("SURAT PENGESAHAN", pageW / 2, y, { align: "center" });
  y += 7;
  doc.setFontSize(13);
  doc.text("SYARAT-SYARAT TEMPAHAN", pageW / 2, y, { align: "center" });
  y += 6;
  doc.setFontSize(10.5);
  doc.text("Lampiran 2", pageW / 2, y, { align: "center" });
  y += 11;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const syaratParas = [
    "a. Pihak penganjur hendaklah memberi surat jaminan kepada pihak kami sebelum sebarang program dilaksanakan.",
    "__b__PENGESAHAN DAN KAEDAH BAYARAN",
    "__h__Kerajaan",
    "Sekiranya bayaran dibuat melalui Pesanan Kerajaan, maka ianya perlu dilengkapkan sebaik sahaja majlis berakhir dan diserahkan oleh penganjur tuan/puan kepada kami selepas penerimaan bil dari MPC.",
    "Pesanan Kerajaan hendaklah disertakan bersama-sama dengan Surat Setuju.",
    "__h__Sektor Swasta / Organisasi / Individu",
    "Bayaran penuh perlu dijelaskan sebelum program bermula.",
    "Sekiranya tuan/puan gagal menjelaskan bayaran seperti yang tersebut di atas, MPC menganggap tempahan terbatal dengan sendirinya. Pengesahan tempahan hanya berkuatkuasa selepas MPC menerima Surat Setuju beserta bayaran yang secukupnya.",
    "Surat jaminan hendaklah dihantar 7 hari bekerja sebelum tarikh program bermula.",
    "Bayaran yang dibuat melalui cek hendaklah ditulis atas nama PERBADANAN PRODUKTIVITI MALAYSIA. Nama bank MAYBANK ISLAMIC cawangan City Square nombor akaun : 551016700534.",
    "__b__PEMBATALAN TEMPAHAN",
    "Pihak penganjur dikehendaki memberi notis secara bertulis kepada MPC sekiranya ingin membatalkan tempahan sekurang-kurangnya 14 hari bekerja sebelum tarikh program bermula.",
    "MPC berhak membatalkan tempahan tuan/puan sekiranya tuan/puan gagal mengembalikan surat setuju terima yang lengkap ditandatangani.",
    "__b__SYARAT-SYARAT PENGGUNAAN",
    "Sebarang penjualan makanan dan minuman tidak dibenarkan di mana-mana kawasan MPC.",
    "Sewaan Dewan Makan (Luar) adalah untuk 200 orang sahaja. Jika melebihi 200 peserta maka sewaan kerusi/meja adalah tanggungan pihak penganjur sendiri.",
    "Penggunaan waktu malam dihadkan sehingga jam 10.30 malam sahaja. Syarat ini dikecualikan bagi program pakej berkursus yang menginap di MPC.",
    "Bayaran akan dikenakan ke atas kerosakan dan kehilangan harta benda MPC. Sebarang kerosakan dan kehilangan harta benda pelanggan adalah tanggungjawab pelanggan itu sendiri.",
    "Pelanggan adalah terikat dengan semua peraturan yang telah ditetapkan.",
    "MPC berhak membatalkan sebarang tempahan dan bayaran pendahuluan akan dikembalikan.",
  ];
  syaratParas.forEach((p) => {
    if (p.startsWith("__b__")) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      const t = p.slice(5);
      if (y > 275) {
        doc.addPage();
        y = 22;
      }
      doc.text(t, marginL, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      return;
    }
    if (p.startsWith("__h__")) {
      doc.setFont("helvetica", "bold");
      const t = p.slice(5);
      if (y > 278) {
        doc.addPage();
        y = 22;
      }
      doc.text(t, marginL, y);
      y += 5.5;
      doc.setFont("helvetica", "normal");
      return;
    }
    const lines = doc.splitTextToSize(p, marginR - marginL);
    if (y + lines.length * 4.8 > 285) {
      doc.addPage();
      y = 22;
    }
    doc.text(lines, marginL, y);
    y += lines.length * 4.8 + 3;
  });

  doc.addPage();
  y = 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("BORANG SETUJU TERIMA", pageW / 2, y, { align: "center" });
  y += 7;
  doc.setFontSize(10.5);
  doc.text("Lampiran 3", pageW / 2, y, { align: "center" });
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Program: " + (b.tujuan || "—"), marginL, y);
  y += 6;
  doc.text("Tarikh: " + (b.tarikh || "—") + "   Jumlah: " + (b.peserta || "—") + " Pax", marginL, y);
  y += 12;
  const setujuParas = [
    "Saya / kami …………………………………………….. No. K/P, bagi pihak Syarikat / Jabatan telah meneliti dan bersetuju dengan kadar sewa, syarat-syarat pengesahan tempahan serta ketetapan melalui surat tuan Bil(" +
      b.noSebutharga +
      ") bertarikh " +
      b.tarikhSebutharga +
      ".",
    "2. Bersama-sama ini disertakan *Pesanan Kerajaan (LPO) / Cek No : ………………….. berjumlah RM …………………… untuk pendahuluan / bayaran tersebut.",
  ];
  setujuParas.forEach((p) => {
    const lines = doc.splitTextToSize(p, marginR - marginL);
    doc.text(lines, marginL, y);
    y += lines.length * 5.5 + 8;
  });
  doc.text("Tandatangan : ………………………….. Cop Syarikat : …………………………..", marginL, y);
  y += 10;
  doc.text("Tarikh : ………………………………….", marginL, y);
  y += 14;
  doc.text("Sila kembalikan salinan yang telah diisi ke bahagian tempahan di alamat :-", marginL, y);
  y += 10;
  doc.text("Perbadanan Produktiviti Malaysia (MPC) Pejabat Wilayah Selatan", marginL, y);
  y += 5.5;
  doc.text("No.8, Jalan Padi Mahsuri, Bandar Baru UDA,", marginL, y);
  y += 5.5;
  doc.text("81200 Johor Bahru, Johor.", marginL, y);
  y += 5.5;
  doc.text("(U/p : Mohd Hykal Mohd Halim)", marginL, y);
  y += 9;
  doc.text("No.Tel: 07 – 237 7422", marginL, y);
  y += 5.5;
  doc.text("No. Faks : 07 – 238 0798", marginL, y);
  y += 8;
  doc.setFontSize(8.5);
  doc.text("*Potong yang tidak berkenaan", marginL, y);

  doc.save("Sebutharga-" + b.id + ".pdf");
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
