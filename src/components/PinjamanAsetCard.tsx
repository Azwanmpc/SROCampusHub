"use client";

import { useState } from "react";
import { Package, CheckCircle, Prohibit, ArrowBendUpLeft, SealCheck } from "@phosphor-icons/react";
import StatusBadge from "@/components/StatusBadge";
import { PINJAMAN_STATUS_LABEL, PINJAMAN_STATUS_COLOR } from "@/lib/constants";

export type PinjamanAset = {
  id: string;
  pemohon: { id: string; name: string };
  jawatan: string;
  bahagian: string;
  tujuan: string;
  tempatDigunakan: string;
  status: string;
  tarikhDijangkaPulang: string;
  tarikhLulus: string | null;
  tarikhDitolak: string | null;
  tarikhDipinjam: string | null;
  tarikhDipulangkan: string | null;
  tarikhDiterima: string | null;
  pelulusNama: string | null;
  pelulusJawatan: string | null;
  pemulangNama: string | null;
  pemulangJawatan: string | null;
  penerimaNama: string | null;
  penerimaJawatan: string | null;
  rejectionReason: string | null;
  createdAt: string;
  items: { id: string; aset: { id: string; namaAset: string; noPendaftaran: string; lokasi: string } }[];
};

export default function PinjamanAsetCard({
  record,
  isStaff,
  isOwner,
  onChanged,
  onPrint,
}: {
  record: PinjamanAset;
  isStaff: boolean;
  isOwner: boolean;
  onChanged: () => void;
  onPrint: (record: PinjamanAset) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  async function callAction(action: string, extra?: Record<string, unknown>) {
    setLoading(true);
    try {
      await fetch(`/api/pinjaman-aset/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      onChanged();
    } finally {
      setLoading(false);
      setShowReject(false);
    }
  }

  return (
    <div className="bg-[var(--white)] p-4">
      <div className="flex flex-wrap items-start gap-3.5">
        <Package weight="duotone" size={22} className="flex-none text-[#6d28d9]" />
        <div className="min-w-[220px] flex-1">
          <div className="text-[14.5px] font-bold">{record.pemohon.name}</div>
          <div className="mt-0.5 text-[12.5px] text-[rgba(var(--ink-rgb),0.6)]">
            {record.jawatan} &middot; {record.bahagian}
          </div>
          <div className="mt-1 text-[12.5px] text-[rgba(var(--ink-rgb),0.6)]">{record.tujuan}</div>
          <div className="mt-0.5 text-xs text-[rgba(var(--ink-rgb),0.55)]">
            Tempat digunakan: {record.tempatDigunakan} &middot; Dijangka pulang: {new Date(record.tarikhDijangkaPulang).toLocaleDateString("ms-MY")}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {record.items.map((it) => (
              <span key={it.id} className="bg-[var(--surface)] px-2 py-0.5 text-[11px] font-bold">
                {it.aset.namaAset}
              </span>
            ))}
          </div>
          {record.status === "DITOLAK" && record.rejectionReason && (
            <div className="mt-1.5 text-xs text-[var(--danger)]">Sebab ditolak: {record.rejectionReason}</div>
          )}
        </div>
        <StatusBadge label={PINJAMAN_STATUS_LABEL[record.status]} colorClass={PINJAMAN_STATUS_COLOR[record.status]} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[rgba(var(--ink-rgb),0.2)] pt-3">
        <button
          onClick={() => onPrint(record)}
          className="border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--surface)] px-3.5 py-2 text-[12.5px] font-bold text-[var(--ink)]"
        >
          Cetak Borang KEW.PA-9
        </button>

        {isStaff && record.status === "MENUNGGU_KELULUSAN" && !showReject && (
          <>
            <button
              onClick={() => callAction("LULUSKAN")}
              disabled={loading}
              className="flex items-center gap-1.5 bg-[#4a8a63] px-3.5 py-2 font-archivo text-[12.5px] font-extrabold text-[#f3f2f2] disabled:opacity-60"
            >
              <SealCheck weight="duotone" /> Luluskan
            </button>
            <button
              onClick={() => setShowReject(true)}
              disabled={loading}
              className="flex items-center gap-1.5 border border-[#ff8a75] bg-[var(--danger-bg)] px-3.5 py-2 font-archivo text-[12.5px] font-extrabold text-[var(--danger)] disabled:opacity-60"
            >
              <Prohibit weight="duotone" /> Tolak
            </button>
          </>
        )}

        {isOwner && record.status === "DILULUSKAN" && (
          <button
            onClick={() => callAction("TANDA_DIPULANGKAN")}
            disabled={loading}
            className="flex items-center gap-1.5 bg-[#6d28d9] px-3.5 py-2 font-archivo text-[12.5px] font-extrabold text-[#f3f2f2] disabled:opacity-60"
          >
            <ArrowBendUpLeft weight="duotone" /> Tandakan Dipulangkan
          </button>
        )}

        {isStaff && record.status === "DIPULANGKAN" && (
          <button
            onClick={() => callAction("SAHKAN_TERIMA")}
            disabled={loading}
            className="flex items-center gap-1.5 bg-[#4a8a63] px-3.5 py-2 font-archivo text-[12.5px] font-extrabold text-[#f3f2f2] disabled:opacity-60"
          >
            <CheckCircle weight="duotone" /> Sahkan Terima
          </button>
        )}
      </div>

      {showReject && (
        <div className="mt-3 border-t border-[rgba(var(--ink-rgb),0.2)] pt-3">
          <label className="mb-1.5 block text-xs text-[rgba(var(--ink-rgb),0.6)]">Sebab Penolakan</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Sebab penolakan..."
            className="mb-2.5 w-full border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--surface)] px-2.5 py-2 text-xs outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => callAction("TOLAK", { rejectionReason: reason })}
              disabled={loading}
              className="flex-1 bg-[#7c1405] py-2 font-archivo text-[13px] font-extrabold text-[#f3f2f2] disabled:opacity-60"
            >
              Sahkan Tolak
            </button>
            <button
              onClick={() => setShowReject(false)}
              className="flex-1 border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--surface)] py-2 text-[13px] font-bold"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
