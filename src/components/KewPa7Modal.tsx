"use client";

import { XCircle, Printer, DownloadSimple } from "@phosphor-icons/react";
import { generateKewPa7 } from "@/lib/asetPdf";

type Aset = { id: string; namaAset: string; noPendaftaran: string; tahun: string | null; lokasi: string; status: string };

const BAHAGIAN = "Perbadanan Produktiviti Malaysia (MPC) Wilayah Selatan";
const MIN_ROWS = 11;

function LokasiForm({ lokasi, items }: { lokasi: string; items: Aset[] }) {
  const rows = Math.max(items.length, MIN_ROWS);
  return (
    <div className="print-page-break bg-white p-4 font-archivo text-[#1a1a1a] sm:p-8">
      <div className="mb-4 text-right text-[12px] font-extrabold sm:mb-6 sm:text-[13px]">KEW.PA-7</div>
      <div className="mb-5 text-center text-[15px] font-extrabold sm:mb-8 sm:text-[18px]">SENARAI ASET ALIH</div>

      <div className="mb-1.5 flex gap-2 text-[11.5px] sm:text-[13px]">
        <span className="w-16 flex-none sm:w-20">BAHAGIAN :</span>
        <span className="flex-1 border-b border-[#1a1a1a] pb-0.5">{BAHAGIAN}</span>
      </div>
      <div className="mb-4 flex gap-2 text-[11.5px] sm:mb-6 sm:text-[13px]">
        <span className="w-16 flex-none sm:w-20">LOKASI :</span>
        <span className="flex-1 border-b border-[#1a1a1a] pb-0.5">{lokasi}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px] border-collapse text-[10.5px] sm:min-w-0 sm:text-[12.5px]">
          <thead>
            <tr className="bg-[#d9d9d9]">
              <th className="w-[8%] border border-[#1a1a1a] px-1.5 py-1.5 sm:px-2">BIL</th>
              <th className="w-[46%] border border-[#1a1a1a] px-1.5 py-1.5 sm:px-2">NO SIRI PENDAFTARAN</th>
              <th className="w-[36%] border border-[#1a1a1a] px-1.5 py-1.5 sm:px-2">KETERANGAN ASET</th>
              <th className="w-[10%] border border-[#1a1a1a] px-1.5 py-1.5 sm:px-2">KUANTITI</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => {
              const item = items[i];
              return (
                <tr key={i}>
                  <td className="border border-[#1a1a1a] px-1.5 py-1 text-center sm:px-2">{i + 1}</td>
                  <td className="border border-[#1a1a1a] px-1.5 py-1 sm:px-2">{item?.noPendaftaran || ""}</td>
                  <td className="border border-[#1a1a1a] px-1.5 py-1 sm:px-2">{item?.namaAset || ""}</td>
                  <td className="border border-[#1a1a1a] px-1.5 py-1 text-center sm:px-2">{item ? 1 : ""}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 text-[11.5px] sm:mt-10 sm:grid-cols-2 sm:text-[13px]">
        <div>
          <div className="mb-9">(a) Disediakan oleh :</div>
          <div className="mb-1 border-b border-dotted border-[#1a1a1a] pb-6" />
          <div className="mb-4 text-center text-[11px] sm:text-[12px]">Tandatangan</div>
          <div className="mb-2">Nama&nbsp;&nbsp;&nbsp;: ____________________</div>
          <div className="mb-2">Jawatan : ____________________</div>
          <div>Tarikh&nbsp;&nbsp;&nbsp;: ____________________</div>
        </div>
        <div>
          <div className="mb-9">(b) Disahkan oleh :</div>
          <div className="mb-1 border-b border-dotted border-[#1a1a1a] pb-6" />
          <div className="mb-4 text-center text-[11px] sm:text-[12px]">Tandatangan</div>
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(32,30,29,0.5)] p-2 sm:p-4">
      <div className="print-area relative max-h-[94vh] w-full max-w-[720px] overflow-y-auto bg-[#e7e5e5] shadow-[0_12px_32px_rgba(45,43,43,0.22)]">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center border border-[rgba(32,30,29,0.4)] bg-white print:hidden sm:right-5 sm:top-5"
        >
          <XCircle weight="duotone" />
        </button>

        {groups.length === 0 ? (
          <div className="bg-white p-10 text-center text-sm text-[rgba(32,30,29,0.6)]">Tiada aset untuk lokasi dipilih.</div>
        ) : (
          groups.map((g) => <LokasiForm key={g.lokasi} lokasi={g.lokasi} items={g.items} />)
        )}

        {groups.length > 0 && (
          <div className="flex flex-col gap-2 bg-[#e7e5e5] p-3 print:hidden sm:flex-row sm:p-4">
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
