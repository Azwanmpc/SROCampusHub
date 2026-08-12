"use client";

import { XCircle, Printer, DownloadSimple } from "@phosphor-icons/react";
import { generateKewPa7 } from "@/lib/asetPdf";

type Aset = { id: string; namaAset: string; noPendaftaran: string; tahun: string | null; lokasi: string; status: string };

const BAHAGIAN = "Perbadanan Produktiviti Malaysia (MPC) Wilayah Selatan";
const MIN_ROWS = 11;

function LokasiForm({ lokasi, items }: { lokasi: string; items: Aset[] }) {
  const rows = Math.max(items.length, MIN_ROWS);
  return (
    <div className="print-page-break bg-white p-8 font-archivo text-[#1a1a1a]">
      <div className="mb-6 text-right text-[13px] font-extrabold">KEW.PA-7</div>
      <div className="mb-8 text-center text-[18px] font-extrabold">SENARAI ASET ALIH</div>

      <div className="mb-1.5 flex gap-2 text-[13px]">
        <span className="w-20 flex-none">BAHAGIAN :</span>
        <span className="flex-1 border-b border-[#1a1a1a] pb-0.5">{BAHAGIAN}</span>
      </div>
      <div className="mb-6 flex gap-2 text-[13px]">
        <span className="w-20 flex-none">LOKASI :</span>
        <span className="flex-1 border-b border-[#1a1a1a] pb-0.5">{lokasi}</span>
      </div>

      <table className="w-full border-collapse text-[12.5px]">
        <thead>
          <tr className="bg-[#d9d9d9]">
            <th className="w-[8%] border border-[#1a1a1a] px-2 py-1.5">BIL</th>
            <th className="w-[46%] border border-[#1a1a1a] px-2 py-1.5">NO SIRI PENDAFTARAN</th>
            <th className="w-[36%] border border-[#1a1a1a] px-2 py-1.5">KETERANGAN ASET</th>
            <th className="w-[10%] border border-[#1a1a1a] px-2 py-1.5">KUANTITI</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => {
            const item = items[i];
            return (
              <tr key={i}>
                <td className="border border-[#1a1a1a] px-2 py-1 text-center">{i + 1}</td>
                <td className="border border-[#1a1a1a] px-2 py-1">{item?.noPendaftaran || ""}</td>
                <td className="border border-[#1a1a1a] px-2 py-1">{item?.namaAset || ""}</td>
                <td className="border border-[#1a1a1a] px-2 py-1 text-center">{item ? 1 : ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-10 grid grid-cols-2 gap-8 text-[13px]">
        <div>
          <div className="mb-9">(a) Disediakan oleh :</div>
          <div className="mb-1 border-b border-dotted border-[#1a1a1a] pb-6" />
          <div className="mb-4 text-center text-[12px]">Tandatangan</div>
          <div className="mb-2">Nama&nbsp;&nbsp;&nbsp;: ____________________</div>
          <div className="mb-2">Jawatan : ____________________</div>
          <div>Tarikh&nbsp;&nbsp;&nbsp;: ____________________</div>
        </div>
        <div>
          <div className="mb-9">(b) Disahkan oleh :</div>
          <div className="mb-1 border-b border-dotted border-[#1a1a1a] pb-6" />
          <div className="mb-4 text-center text-[12px]">Tandatangan</div>
          <div className="mb-2">Nama&nbsp;&nbsp;&nbsp;: ____________________</div>
          <div className="mb-2">Jawatan : ____________________</div>
          <div>Tarikh&nbsp;&nbsp;&nbsp;: ____________________</div>
        </div>
      </div>
    </div>
  );
}

export default function KewPa7Modal({ lokasiList, records, onClose }: { lokasiList: string[]; records: Aset[]; onClose: () => void }) {
  const groups = lokasiList.map((lokasi) => ({ lokasi, items: records.filter((r) => r.lokasi === lokasi) })).filter((g) => g.items.length > 0);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(32,30,29,0.5)] p-4">
      <div className="print-area relative max-h-[92vh] w-full max-w-[720px] overflow-y-auto bg-[#e7e5e5] shadow-[0_12px_32px_rgba(45,43,43,0.22)]">
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 flex h-8 w-8 items-center justify-center border border-[rgba(32,30,29,0.4)] bg-white print:hidden"
        >
          <XCircle weight="duotone" />
        </button>

        {groups.length === 0 ? (
          <div className="bg-white p-10 text-center text-sm text-[rgba(32,30,29,0.6)]">Tiada aset untuk lokasi dipilih.</div>
        ) : (
          groups.map((g) => <LokasiForm key={g.lokasi} lokasi={g.lokasi} items={g.items} />)
        )}

        {groups.length > 0 && (
          <div className="flex flex-col gap-2 bg-[#e7e5e5] p-4 print:hidden sm:flex-row">
            <button
              onClick={() => window.print()}
              className="flex flex-1 items-center justify-center gap-2 border border-[rgba(32,30,29,0.4)] bg-[#f3f2f2] py-3 font-archivo text-[13.5px] font-extrabold"
            >
              <Printer weight="duotone" /> Cetak
            </button>
            <button
              onClick={() => generateKewPa7(groups.map((g) => g.lokasi), records)}
              className="flex flex-1 items-center justify-center gap-2 bg-[#201e1d] py-3 font-archivo text-[13.5px] font-extrabold text-[#f3f2f2]"
            >
              <DownloadSimple weight="duotone" /> Simpan PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
