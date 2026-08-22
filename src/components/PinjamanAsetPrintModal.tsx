"use client";

import { XCircle, Printer, DownloadSimple } from "@phosphor-icons/react";
import { generateKewPa9 } from "@/lib/pinjamanAsetPdf";
import type { PinjamanAset } from "@/components/PinjamanAsetCard";

function fmtTarikh(iso: string | null) {
  if (!iso) return "____________________";
  return new Date(iso).toLocaleDateString("ms-MY");
}

function SigBlock({
  title,
  nama,
  jawatan,
  tarikh,
  jawatanLabel = "Jawatan",
}: {
  title: string;
  nama: string;
  jawatan: string;
  tarikh: string;
  jawatanLabel?: string;
}) {
  return (
    <div>
      <div className="mb-1 border-b border-dotted border-[#1a1a1a] pb-6" />
      <div className="mb-3 text-[11px] sm:text-[12px]">{title}</div>
      <div className="mb-1.5 flex gap-1">
        <span className="w-[150px] flex-none">Nama</span>
        <span>: {nama || "____________________"}</span>
      </div>
      <div className="mb-1.5 flex gap-1">
        <span className="w-[150px] flex-none">{jawatanLabel}</span>
        <span>: {jawatan || "____________________"}</span>
      </div>
      <div className="flex gap-1">
        <span className="w-[150px] flex-none">Tarikh</span>
        <span>: {tarikh}</span>
      </div>
    </div>
  );
}

// Pelulus (Pegawai Aset) and Pengeluar on the printed KEW.PA-9 always reflect the designated
// officers for this process, not whichever staff account actually clicked "Luluskan" in the
// system — that real approver identity still stays on the record for internal audit purposes.
const PELULUS_NAMA_TETAP = "Azimah Bt Adnan";
const PELULUS_JAWATAN_TETAP = "Pengurus Kanan";
const PENGELUAR_NAMA_TETAP = "Mohd Hykal B Mohd Halim";
const PENGELUAR_JAWATAN_TETAP = "Penolong Pegawai";

export default function PinjamanAsetPrintModal({ record, onClose }: { record: PinjamanAset; onClose: () => void }) {
  const isApproved = !!record.tarikhLulus;
  const pelulusNamaFixed = isApproved ? PELULUS_NAMA_TETAP : "";
  const pelulusJawatanFixed = isApproved ? PELULUS_JAWATAN_TETAP : "";
  const pengeluarNamaFixed = isApproved ? PENGELUAR_NAMA_TETAP : "";
  const pengeluarJawatanFixed = isApproved ? PENGELUAR_JAWATAN_TETAP : "";

  const isDiterima = !!record.tarikhDiterima;
  const penerimaNamaFixed = isDiterima ? PENGELUAR_NAMA_TETAP : "";
  const penerimaJawatanFixed = isDiterima ? PENGELUAR_JAWATAN_TETAP : "";

  const dateVals = [
    fmtTarikh(record.tarikhLulus),
    fmtTarikh(record.tarikhDipinjam),
    fmtTarikh(record.tarikhDijangkaPulang),
    fmtTarikh(record.tarikhDipulangkan),
    fmtTarikh(record.tarikhDiterima),
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(32,30,29,0.5)] p-2 sm:p-4">
      <div className="print-area relative max-h-[94vh] w-full max-w-[760px] overflow-y-auto bg-[#e7e5e5] shadow-[0_12px_32px_rgba(45,43,43,0.22)]">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center border border-[rgba(32,30,29,0.4)] bg-white print:hidden sm:right-5 sm:top-5"
        >
          <XCircle weight="duotone" />
        </button>

        <div className="print-page-break bg-white p-4 font-archivo text-[#1a1a1a] sm:p-8">
          <div className="mb-6 flex items-start justify-between text-[10.5px] sm:text-[11px]">
            <span>Pekeliling Perbendaharaan Malaysia AM 2.4 Lampiran A</span>
            <span className="text-right font-extrabold">
              KEW.PA-9
              <br />
              <span className="font-normal">No. Permohonan : {record.id.slice(-8).toUpperCase()}</span>
            </span>
          </div>

          <div className="mb-6 text-center text-[14px] font-extrabold leading-snug sm:text-[16px]">
            BORANG PERMOHONAN PERGERAKAN/ PINJAMAN ASET ALIH
          </div>

          <div className="mb-6 grid grid-cols-1 gap-x-6 gap-y-2 text-[11.5px] sm:grid-cols-2 sm:text-[13px]">
            <div className="flex gap-2">
              <span className="w-28 flex-none">Nama Pemohon :</span>
              <span className="flex-1 border-b border-[#1a1a1a]">{record.pemohon.name}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-28 flex-none">Tujuan :</span>
              <span className="flex-1 border-b border-[#1a1a1a]">{record.tujuan}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-28 flex-none">Jawatan :</span>
              <span className="flex-1 border-b border-[#1a1a1a]">{record.jawatan}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-28 flex-none">Tempat Digunakan :</span>
              <span className="flex-1 border-b border-[#1a1a1a]">{record.tempatDigunakan}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-28 flex-none">Bahagian :</span>
              <span className="flex-1 border-b border-[#1a1a1a]">{record.bahagian}</span>
            </div>
            <div className="flex gap-2">
              <span className="w-28 flex-none">Nama Pengeluar :</span>
              <span className="flex-1 border-b border-[#1a1a1a]">{pengeluarNamaFixed}</span>
            </div>
            <div className="flex gap-2 sm:col-start-2">
              <span className="w-28 flex-none">Jawatan :</span>
              <span className="flex-1 border-b border-[#1a1a1a]">{pengeluarJawatanFixed}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-collapse text-[9px] sm:min-w-0 sm:text-[10px]">
              <thead>
                <tr className="bg-[#d9d9d9]">
                  <th rowSpan={2} className="border border-[#1a1a1a] px-1 py-1">
                    Bil.
                  </th>
                  <th rowSpan={2} className="border border-[#1a1a1a] px-1 py-1">
                    No. Siri Pendaftaran
                  </th>
                  <th rowSpan={2} className="border border-[#1a1a1a] px-1 py-1">
                    Keterangan Aset
                  </th>
                  <th rowSpan={2} className="border border-[#1a1a1a] px-1 py-1">
                    Tarikh (Lulus/ Tidak Lulus)
                  </th>
                  <th colSpan={4} className="border border-[#1a1a1a] px-1 py-1">
                    Tarikh
                  </th>
                  <th rowSpan={2} className="border border-[#1a1a1a] px-1 py-1">
                    Catatan
                  </th>
                </tr>
                <tr className="bg-[#d9d9d9]">
                  <th className="border border-[#1a1a1a] px-1 py-1">Dipinjam</th>
                  <th className="border border-[#1a1a1a] px-1 py-1">Dijangka Pulang</th>
                  <th className="border border-[#1a1a1a] px-1 py-1">Dipulangkan</th>
                  <th className="border border-[#1a1a1a] px-1 py-1">Diterima</th>
                </tr>
              </thead>
              <tbody>
                {record.items.map((it, i) => (
                  <tr key={it.id}>
                    <td className="border border-[#1a1a1a] px-1 py-1 text-center">{i + 1}</td>
                    <td className="border border-[#1a1a1a] px-1 py-1">{it.aset.noPendaftaran || "-"}</td>
                    <td className="border border-[#1a1a1a] px-1 py-1">{it.aset.namaAset}</td>
                    {dateVals.map((v, di) => (
                      <td key={di} className="border border-[#1a1a1a] px-1 py-1 text-center">
                        {v === "____________________" ? "" : v}
                      </td>
                    ))}
                    <td className="border border-[#1a1a1a] px-1 py-1" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-10 text-[11.5px] sm:grid-cols-2 sm:text-[13px]">
            <SigBlock title="(Tandatangan Peminjam)" nama={record.pemohon.name} jawatan={record.jawatan} tarikh={fmtTarikh(record.createdAt)} />
            <SigBlock
              title="(Tandatangan Pelulus)"
              nama={pelulusNamaFixed}
              jawatan={pelulusJawatanFixed}
              jawatanLabel="Pelulus (Pegawai Aset)"
              tarikh={fmtTarikh(record.tarikhLulus)}
            />
            <SigBlock title="(Tandatangan Pemulang)" nama={record.pemulangNama ?? ""} jawatan={record.pemulangJawatan ?? ""} tarikh={fmtTarikh(record.tarikhDipulangkan)} />
            <SigBlock title="(Tandatangan Penerima)" nama={penerimaNamaFixed} jawatan={penerimaJawatanFixed} tarikh={fmtTarikh(record.tarikhDiterima)} />
          </div>
        </div>

        <div className="flex flex-col gap-2 bg-[#e7e5e5] p-3 print:hidden sm:flex-row sm:p-4">
          <button
            onClick={() => window.print()}
            className="flex flex-1 items-center justify-center gap-2 border border-[rgba(32,30,29,0.4)] bg-[#f3f2f2] py-3 font-archivo text-[13.5px] font-extrabold"
          >
            <Printer weight="duotone" /> Cetak
          </button>
          <button
            onClick={() => generateKewPa9(record)}
            className="flex flex-1 items-center justify-center gap-2 bg-[#201e1d] py-3 font-archivo text-[13.5px] font-extrabold text-[#f3f2f2]"
          >
            <DownloadSimple weight="duotone" /> Simpan PDF
          </button>
        </div>
      </div>
    </div>
  );
}
