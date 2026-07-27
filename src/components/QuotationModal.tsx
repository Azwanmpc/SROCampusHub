"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle, Printer, DownloadSimple, EnvelopeSimple } from "@phosphor-icons/react";
import { generateQuotationPdf } from "@/lib/quotationPdf";

type Booking = {
  id: string;
  facility: { name: string };
  purpose: string;
  startDateTime: string;
  participantCount: number;
  user: { name: string };
  sebutNama: string | null;
  sebutTel: string | null;
  sebutEmel: string | null;
  organisasi: string | null;
  revenue: number;
  finalPrice: number | null;
  discount: number;
  quotationNumber: string | null;
  addonsJson: string | null;
};

function fmtRM(n: number) {
  return `RM ${n.toLocaleString("ms-MY")}`;
}

export default function QuotationModal({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const router = useRouter();
  const noSebutharga = booking.quotationNumber || `dlm.MPC(WS)307.2 Kt.${booking.id.slice(-4)}`;
  const tarikhSebutharga = new Date().toLocaleDateString("ms-MY", { day: "numeric", month: "long", year: "numeric" });
  const [overrideValue, setOverrideValue] = useState(String(booking.finalPrice ?? booking.revenue));
  const [saving, setSaving] = useState(false);

  const finalPrice = Number(overrideValue) || booking.revenue;
  const discount = booking.revenue - finalPrice;
  const addons = booking.addonsJson ? (JSON.parse(booking.addonsJson) as { label: string; rateType: string; qty: number; price: number }[]) : [];

  async function savePrice() {
    setSaving(true);
    try {
      await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "SET_QUOTATION_PRICE", finalPrice: Number(overrideValue) || booking.revenue, quotationNumber: noSebutharga }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePdf() {
    await savePrice();
    await generateQuotationPdf({
      id: booking.id,
      facilitiesLabel: booking.facility.name,
      tujuan: booking.purpose,
      tarikh: new Date(booking.startDateTime).toLocaleDateString("ms-MY"),
      peserta: booking.participantCount,
      pemohon: booking.sebutNama || booking.user.name,
      sebutTel: booking.sebutTel || "",
      sebutOrganisasi: booking.organisasi || "",
      kos: booking.revenue,
      finalPrice,
      itemsBreakdown: [{ nama: booking.facility.name, rateLabel: "Sehari", price: booking.revenue - addons.reduce((s, a) => s + a.price, 0) }],
      addonsBreakdown: addons.map((a) => ({ label: a.label, rateTypeLabel: a.rateType === "HALF" ? "Separuh Hari" : "Satu Hari", qty: a.qty, price: a.price })),
      noSebutharga,
      tarikhSebutharga,
    });
  }

  async function handleEmail() {
    await savePrice();
    const to = booking.sebutEmel || "";
    const cc = "hykal@mpc.gov.my,atiqah@mpc.gov.my";
    const subject = `Sebutharga ${noSebutharga} — ${booking.facility.name}`;
    const body = `Tuan/Puan ${booking.sebutNama || booking.user.name},%0D%0A%0D%0ADisertakan sebutharga tempahan ${booking.facility.name} bertarikh ${new Date(booking.startDateTime).toLocaleDateString("ms-MY")}.%0D%0AJumlah Akhir: ${fmtRM(finalPrice)}.%0D%0A%0D%0ATerima kasih.`;
    window.location.href = `mailto:${to}?cc=${cc}&subject=${encodeURIComponent(subject)}&body=${body}`;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(32,30,29,0.5)] p-4">
      <div
        id="quotation-print-area"
        className="relative max-h-[92vh] w-full max-w-[620px] overflow-y-auto bg-white p-5 font-archivo text-[#201e1d] shadow-[0_12px_32px_rgba(45,43,43,0.22)] sm:p-9"
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center border border-[rgba(32,30,29,0.4)] bg-[#f3f2f2]"
        >
          <XCircle weight="duotone" />
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/mpc-letterhead.png" alt="Letterhead MPC" className="mb-4 w-full" />
        <div className="mb-[22px] h-0.5 bg-[#201e1d]" />

        <div className="mb-4 text-[12.5px]">
          Bil({noSebutharga}) &nbsp;&nbsp;&nbsp; {tarikhSebutharga}
        </div>
        <div className="mb-4 text-[12.5px]">
          {booking.organisasi || booking.sebutNama || booking.user.name}
          <br />
          Tel: {booking.sebutTel || "—"}
          <br />
          (U/p : {booking.sebutNama || booking.user.name})
        </div>
        <div className="mb-2.5 text-[12.5px]">Tuan,</div>
        <div className="mb-3 text-[12.5px] font-bold">Sebutharga Sewa Kemudahan Di MPC Wilayah Selatan.</div>
        <div className="mb-2.5 text-[12.5px]">Dengan segala hormatnya merujuk perkara di atas.</div>
        <div className="mb-2.5 text-[12.5px]">
          Bersama-sama ini disertakan kadar bayaran yang dikenakan (Lampiran 1) dan Syarat-syarat Pengesahan Tempahan Kemudahan
          Pejabat MPC Wilayah Selatan (Lampiran 2) untuk tindakan Tuan.
        </div>
        <div className="mb-2.5 text-[12.5px]">
          Sila sahkan tempahan Tuan dengan menandatangani dan mengembalikan surat setuju (Lampiran 3) selewat-lewatnya 7 hari dari
          tarikh surat ini.
        </div>
        <div className="mb-5 text-[12.5px]">
          Perbadanan Produktiviti Malaysia (MPC) Pejabat Wilayah Selatan mengalu-alukan kedatangan pihak Tuan bersama
          peserta-peserta program ke kompleks kami. Kami berharap agar pihak Tuan berpuas hati dengan perkhidmatan yang kami
          berikan.
        </div>
        <div className="mb-6.5 text-[12.5px]">Sekian, terima kasih.</div>

        <div className="mb-6.5 text-[11.5px] font-bold leading-[1.6]">
          &ldquo;BERKHIDMAT UNTUK NEGARA&rdquo;
          <br />
          &ldquo;MEMACU PRODUKTIVITI NEGARA&rdquo;
        </div>

        <div className="mb-6.5 text-[12.5px]">
          Saya yang menurut perintah,
          <br />
          <br />
          <span className="font-extrabold">Mohd Hykal Mohd Halim</span>
          <br />
          b.p Pengarah
          <br />
          Perbadanan Produktiviti Malaysia (MPC) Wilayah Selatan
        </div>

        <div className="mb-6.5 text-[12.5px]">S.k. Fail Timbul</div>

        <div className="mb-1.5 text-center text-xs font-bold">Lampiran 1</div>
        <div className="mb-4 text-center font-archivo text-sm font-extrabold">KADAR HARGA</div>
        <div className="mb-3.5 text-xs">
          <div>
            <span className="font-bold">Program:</span> {booking.purpose}
          </div>
          <div>
            <span className="font-bold">Tarikh:</span> {new Date(booking.startDateTime).toLocaleDateString("ms-MY")}
            &nbsp;&nbsp; <span className="font-bold">Jumlah:</span> {booking.participantCount} Pax
          </div>
        </div>

        <table className="mb-3.5 w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="border-b border-[rgba(32,30,29,0.3)] py-1.5 text-left text-[10px] uppercase text-[rgba(32,30,29,0.55)]">Fasiliti</th>
              <th className="border-b border-[rgba(32,30,29,0.3)] py-1.5 text-left text-[10px] uppercase text-[rgba(32,30,29,0.55)]">Kadar</th>
              <th className="border-b border-[rgba(32,30,29,0.3)] py-1.5 text-right text-[10px] uppercase text-[rgba(32,30,29,0.55)]">Harga</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border-b border-[rgba(32,30,29,0.15)] py-1.5 font-bold">{booking.facility.name}</td>
              <td className="border-b border-[rgba(32,30,29,0.15)] py-1.5 text-[rgba(32,30,29,0.6)]">Sehari</td>
              <td className="border-b border-[rgba(32,30,29,0.15)] py-1.5 text-right">
                {fmtRM(booking.revenue - addons.reduce((s, a) => s + a.price, 0))}
              </td>
            </tr>
            {addons.map((a, i) => (
              <tr key={i}>
                <td className="border-b border-[rgba(32,30,29,0.15)] py-1.5 font-bold">{a.label} (Add-on)</td>
                <td className="border-b border-[rgba(32,30,29,0.15)] py-1.5 text-[rgba(32,30,29,0.6)]">
                  {a.rateType === "HALF" ? "Separuh Hari" : "Satu Hari"} × {a.qty}
                </td>
                <td className="border-b border-[rgba(32,30,29,0.15)] py-1.5 text-right">{fmtRM(a.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex flex-col gap-2.5 border border-[rgba(32,30,29,0.3)] bg-[#f3f2f2] p-3.5">
          <div className="flex justify-between text-[13px]">
            <span>Anggaran Asal</span>
            <span className="font-bold">{fmtRM(booking.revenue)}</span>
          </div>
          <label className="flex flex-col gap-1.5 text-xs text-[rgba(32,30,29,0.7)]">
            Harga Akhir (admin boleh ubah jika ada diskaun)
            <input
              type="number"
              value={overrideValue}
              onChange={(e) => setOverrideValue(e.target.value)}
              onBlur={savePrice}
              className="min-h-9 w-full border border-[rgba(32,30,29,0.4)] bg-white px-2.5 py-1.5 text-sm outline-none"
            />
          </label>
          {discount > 0 && (
            <div className="flex justify-between text-[12.5px] font-bold text-[#4a8a63]">
              <span>Diskaun Diberikan</span>
              <span>{fmtRM(discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-[rgba(32,30,29,0.3)] pt-2 font-archivo text-base font-extrabold">
            <span>Jumlah Akhir</span>
            <span>{fmtRM(finalPrice)}</span>
          </div>
        </div>

        <div className="mb-1 mt-6.5 text-center font-bold" style={{ breakBefore: "page" }}>
          SURAT PENGESAHAN
        </div>
        <div className="mb-1 text-center font-archivo text-sm font-extrabold">SYARAT-SYARAT TEMPAHAN</div>
        <div className="mb-4.5 text-center text-[11.5px] font-bold">Lampiran 2</div>
        <div className="mb-3.5 text-xs">
          a. Pihak penganjur hendaklah memberi surat jaminan kepada pihak kami sebelum sebarang program dilaksanakan.
        </div>
        <div className="mb-2 text-xs font-bold">PENGESAHAN DAN KAEDAH BAYARAN</div>
        <div className="mb-1 text-xs font-bold">Kerajaan</div>
        <div className="mb-1.5 text-xs">
          Sekiranya bayaran dibuat melalui Pesanan Kerajaan, maka ianya perlu dilengkapkan sebaik sahaja majlis berakhir dan
          diserahkan oleh penganjur tuan/puan kepada kami selepas penerimaan bil dari MPC.
        </div>
        <div className="mb-3 text-xs">Pesanan Kerajaan hendaklah disertakan bersama-sama dengan Surat Setuju.</div>
        <div className="mb-1 text-xs font-bold">Sektor Swasta / Organisasi / Individu</div>
        <div className="mb-1.5 text-xs">Bayaran penuh perlu dijelaskan sebelum program bermula.</div>
        <div className="mb-1.5 text-xs">
          Sekiranya tuan/puan gagal menjelaskan bayaran seperti yang tersebut di atas, MPC menganggap tempahan terbatal dengan
          sendirinya. Pengesahan tempahan hanya berkuatkuasa selepas MPC menerima Surat Setuju beserta bayaran yang secukupnya.
        </div>
        <div className="mb-1.5 text-xs">Surat jaminan hendaklah dihantar 7 hari bekerja sebelum tarikh program bermula.</div>
        <div className="mb-3.5 text-xs">
          Bayaran yang dibuat melalui cek hendaklah ditulis atas nama PERBADANAN PRODUKTIVITI MALAYSIA. Nama bank MAYBANK ISLAMIC
          cawangan City Square nombor akaun : 551016700534.
        </div>
        <div className="mb-2 text-xs font-bold">PEMBATALAN TEMPAHAN</div>
        <div className="mb-1.5 text-xs">
          Pihak penganjur dikehendaki memberi notis secara bertulis kepada MPC sekiranya ingin membatalkan tempahan
          sekurang-kurangnya 14 hari bekerja sebelum tarikh program bermula.
        </div>
        <div className="mb-3.5 text-xs">
          MPC berhak membatalkan tempahan tuan/puan sekiranya tuan/puan gagal mengembalikan surat setuju terima yang lengkap
          ditandatangani.
        </div>
        <div className="mb-2 text-xs font-bold">SYARAT-SYARAT PENGGUNAAN</div>
        <div className="mb-1.5 text-xs">Sebarang penjualan makanan dan minuman tidak dibenarkan di mana-mana kawasan MPC.</div>
        <div className="mb-1.5 text-xs">
          Sewaan Dewan Makan (Luar) adalah untuk 200 orang sahaja. Jika melebihi 200 peserta maka sewaan kerusi/meja adalah
          tanggungan pihak penganjur sendiri.
        </div>
        <div className="mb-1.5 text-xs">
          Penggunaan waktu malam dihadkan sehingga jam 10.30 malam sahaja. Syarat ini dikecualikan bagi program pakej berkursus
          yang menginap di MPC.
        </div>
        <div className="mb-1.5 text-xs">
          Bayaran akan dikenakan ke atas kerosakan dan kehilangan harta benda MPC. Sebarang kerosakan dan kehilangan harta benda
          pelanggan adalah tanggungjawab pelanggan itu sendiri.
        </div>
        <div className="mb-1.5 text-xs">Pelanggan adalah terikat dengan semua peraturan yang telah ditetapkan.</div>
        <div className="text-xs">MPC berhak membatalkan sebarang tempahan dan bayaran pendahuluan akan dikembalikan.</div>

        <div className="mb-1 mt-6.5 text-center font-archivo text-sm font-extrabold" style={{ breakBefore: "page" }}>
          BORANG SETUJU TERIMA
        </div>
        <div className="mb-4.5 text-center text-[11.5px] font-bold">Lampiran 3</div>
        <div className="mb-3.5 text-xs">
          <div>
            <span className="font-bold">Program:</span> {booking.purpose}
          </div>
          <div>
            <span className="font-bold">Tarikh:</span> {new Date(booking.startDateTime).toLocaleDateString("ms-MY")}
            &nbsp;&nbsp; <span className="font-bold">Jumlah:</span> {booking.participantCount} Pax
          </div>
        </div>
        <div className="mb-3.5 text-[12.5px]">
          Saya / kami …………………………………………….. No. K/P, bagi pihak Syarikat / Jabatan telah meneliti dan bersetuju dengan kadar
          sewa, syarat-syarat pengesahan tempahan serta ketetapan melalui surat tuan Bil({noSebutharga}) bertarikh {tarikhSebutharga}.
        </div>
        <div className="mb-6 text-[12.5px]">
          2. Bersama-sama ini disertakan *Pesanan Kerajaan (LPO) / Cek No : ………………….. berjumlah RM …………………… untuk pendahuluan /
          bayaran tersebut.
        </div>
        <div className="mb-2 text-[12.5px]">Tandatangan : ………………………….. &nbsp;&nbsp;&nbsp; Cop Syarikat : …………………………..</div>
        <div className="mb-5 text-[12.5px]">Tarikh : ………………………………….</div>
        <div className="mb-3.5 text-xs">Sila kembalikan salinan yang telah diisi ke bahagian tempahan di alamat :-</div>
        <div className="mb-1.5 text-[12.5px]">
          Perbadanan Produktiviti Malaysia (MPC) Pejabat Wilayah Selatan
          <br />
          No.8, Jalan Padi Mahsuri, Bandar Baru UDA,
          <br />
          81200 Johor Bahru, Johor.
          <br />
          (U/p : Mohd Hykal Mohd Halim)
        </div>
        <div className="mb-1 text-xs">No.Tel: 07 – 237 7422</div>
        <div className="mb-2.5 text-xs">No. Faks : 07 – 238 0798</div>
        <div className="text-[11px] text-[rgba(32,30,29,0.6)]">*Potong yang tidak berkenaan</div>

        <div className="mt-3.5 flex flex-col gap-2 print:hidden sm:flex-row">
          <button
            onClick={() => window.print()}
            className="flex flex-1 items-center justify-center gap-2 border border-[rgba(32,30,29,0.4)] bg-[#f3f2f2] py-3 font-archivo text-[13.5px] font-extrabold"
          >
            <Printer weight="duotone" /> Cetak
          </button>
          <button
            onClick={handleSavePdf}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 bg-[#201e1d] py-3 font-archivo text-[13.5px] font-extrabold text-[#f3f2f2] disabled:opacity-60"
          >
            <DownloadSimple weight="duotone" /> Simpan PDF
          </button>
          <button
            onClick={handleEmail}
            className="flex flex-1 items-center justify-center gap-2 bg-[#6d28d9] py-3 font-archivo text-[13.5px] font-extrabold text-[#f3f2f2]"
          >
            <EnvelopeSimple weight="duotone" /> Hantar Emel
          </button>
        </div>
      </div>
    </div>
  );
}
