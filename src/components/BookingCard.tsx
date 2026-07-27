"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Buildings, SealCheck, Prohibit, Clock, FileText, Trash, ArrowCounterClockwise } from "@phosphor-icons/react";
import StatusBadge from "./StatusBadge";
import QuotationModal from "./QuotationModal";
import { BOOKING_STATUS_LABEL, BOOKING_STATUS_COLOR, ARRANGEMENT_LABEL } from "@/lib/constants";

type Booking = {
  id: string;
  facilityId: string;
  facility: { name: string; type: string };
  user: { name: string };
  startDateTime: string;
  endDateTime: string;
  purpose: string;
  participantCount: number;
  arrangement: string;
  addOnProjector: number;
  addOnTv100: number;
  earlyAccess: boolean;
  earlyAccessMinutes: number;
  status: string;
  rejectionReason: string | null;
  revenue: number;
  finalPrice: number | null;
  discount: number;
  quotationNumber: string | null;
  organisasi: string | null;
  sebutNama: string | null;
  sebutTel: string | null;
  sebutEmel: string | null;
  addonsJson: string | null;
  checkInAt: string | null;
  checkOutAt: string | null;
};

export default function BookingCard({
  booking,
  canApprove,
  showCancel,
}: {
  booking: Booking;
  canApprove: boolean;
  showCancel?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [showQuotation, setShowQuotation] = useState(false);

  async function callAction(action: string, extra?: Record<string, unknown>) {
    setLoading(true);
    try {
      await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      router.refresh();
    } finally {
      setLoading(false);
      setShowReject(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Padam tempahan ini?")) return;
    await callAction("CANCEL");
  }

  const hasAddons = booking.addOnProjector > 0 || booking.addOnTv100 > 0;
  const isAsrama = booking.facility.type === "Asrama";

  return (
    <div className="bg-white p-4">
      <div className="flex flex-wrap items-start gap-3.5">
        <Buildings weight="duotone" size={22} className="flex-none text-[#4a72a8]" />
        <div className="min-w-[220px] flex-1">
          <div className="text-[14.5px] font-bold">
            {booking.facility.name} — {booking.purpose}
          </div>
          <div className="mt-0.5 text-[12.5px] text-[rgba(32,30,29,0.6)]">
            {booking.user.name} · {booking.participantCount} peserta · {ARRANGEMENT_LABEL[booking.arrangement]}
          </div>
          <div className="text-[12.5px] text-[rgba(32,30,29,0.6)]">
            {new Date(booking.startDateTime).toLocaleString("ms-MY")} – {new Date(booking.endDateTime).toLocaleString("ms-MY")}
            {" · "}Anggaran hasil RM {booking.revenue.toLocaleString("ms-MY")}
          </div>
          {hasAddons && (
            <div className="mt-1 text-xs font-bold text-[#6d28d9]">
              {booking.addOnProjector > 0 && `${booking.addOnProjector}x LCD Projektor `}
              {booking.addOnTv100 > 0 && `${booking.addOnTv100}x TV LCD 100"`}
            </div>
          )}
          {booking.earlyAccess && (
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[#8a6d1f]">
              <Clock weight="duotone" /> Minta masuk awal: {booking.earlyAccessMinutes} minit
            </div>
          )}
        </div>
        <StatusBadge label={BOOKING_STATUS_LABEL[booking.status]} colorClass={BOOKING_STATUS_COLOR[booking.status]} />
      </div>

      {canApprove && booking.status === "MENUNGGU" && !showReject && (
        <div className="mt-3.5 flex gap-px border-t border-[rgba(32,30,29,0.2)] pt-3.5">
          <button
            onClick={() => callAction("APPROVE")}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-1.5 bg-[#4a8a63] py-2 font-archivo text-[13px] font-extrabold text-[#f3f2f2] disabled:opacity-60"
          >
            <SealCheck weight="duotone" /> Sahkan
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={loading}
            className="ml-2 flex flex-1 items-center justify-center gap-1.5 border border-[#ff8a75] bg-[#fff2ef] py-2 font-archivo text-[13px] font-extrabold text-[#7c1405] disabled:opacity-60"
          >
            <Prohibit weight="duotone" /> Tolak
          </button>
        </div>
      )}

      {canApprove && showReject && (
        <div className="mt-3.5 border-t border-[rgba(32,30,29,0.2)] pt-3.5">
          <label className="mb-1.5 block text-xs text-[rgba(32,30,29,0.6)]">Nota Penolakan</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Sebab penolakan…"
            className="mb-2.5 w-full border border-[rgba(32,30,29,0.4)] bg-[#f3f2f2] px-2.5 py-2 text-xs outline-none"
          />
          <div className="flex gap-2">
            <button
              onClick={() => callAction("REJECT", { rejectionReason: reason })}
              disabled={loading}
              className="flex-1 bg-[#7c1405] py-2 font-archivo text-[13px] font-extrabold text-[#f3f2f2] disabled:opacity-60"
            >
              Sahkan Tolak
            </button>
            <button
              onClick={() => setShowReject(false)}
              className="flex-1 border border-[rgba(32,30,29,0.4)] bg-[#f3f2f2] py-2 text-[13px] font-bold"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {showCancel && booking.status === "MENUNGGU" && (
        <div className="mt-3.5 border-t border-[rgba(32,30,29,0.2)] pt-3.5">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="border border-[#7c1405] px-3.5 py-2 text-xs font-bold text-[#7c1405] disabled:opacity-60"
          >
            Batalkan Tempahan
          </button>
        </div>
      )}

      {booking.status === "DITOLAK" && (
        <div className="mt-3.5 border-t border-[rgba(32,30,29,0.2)] pt-3.5">
          {booking.rejectionReason && (
            <div className="mb-2.5 text-xs text-[rgba(32,30,29,0.6)]">Sebab: {booking.rejectionReason}</div>
          )}
          {canApprove && (
            <button
              onClick={() => callAction("APPROVE")}
              disabled={loading}
              className="flex w-full items-center justify-center gap-1.5 border border-[#4a72a8] bg-[#f3f2f2] py-2 font-archivo text-[13px] font-extrabold text-[#4a72a8] disabled:opacity-60"
            >
              <ArrowCounterClockwise weight="duotone" /> Pulihkan ke Menunggu
            </button>
          )}
        </div>
      )}

      {canApprove && booking.status === "DISAHKAN" && (
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-[rgba(32,30,29,0.2)] pt-3.5">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowQuotation(true)}
              className="flex items-center gap-1.5 border border-[rgba(32,30,29,0.4)] bg-[#f3f2f2] px-3.5 py-2 text-[13px] font-bold"
            >
              <FileText weight="duotone" /> Jana Sebutharga
            </button>
            {isAsrama && !booking.checkInAt && (
              <button
                onClick={() => callAction("CHECK_IN")}
                disabled={loading}
                className="bg-[#6d28d9] px-3.5 py-2 font-archivo text-[13px] font-extrabold text-[#f3f2f2] disabled:opacity-60"
              >
                Check-In
              </button>
            )}
            {isAsrama && booking.checkInAt && !booking.checkOutAt && (
              <button
                onClick={() => callAction("CHECK_OUT")}
                disabled={loading}
                className="bg-[#201e1d] px-3.5 py-2 font-archivo text-[13px] font-extrabold text-[#f3f2f2] disabled:opacity-60"
              >
                Check-Out
              </button>
            )}
            {isAsrama && booking.checkInAt && booking.checkOutAt && (
              <span className="self-center text-xs text-[rgba(32,30,29,0.5)]">Selesai Check-Out</span>
            )}
          </div>
          <button onClick={handleDelete} className="flex items-center gap-1.5 border border-[#6d28d9] px-3 py-1.5 text-xs font-bold text-[#6d28d9]">
            <Trash weight="duotone" /> Padam
          </button>
        </div>
      )}

      {showQuotation && (
        <QuotationModal
          booking={{
            id: booking.id,
            facility: booking.facility,
            purpose: booking.purpose,
            startDateTime: booking.startDateTime,
            participantCount: booking.participantCount,
            user: booking.user,
            sebutNama: booking.sebutNama,
            sebutTel: booking.sebutTel,
            sebutEmel: booking.sebutEmel,
            organisasi: booking.organisasi,
            revenue: booking.revenue,
            finalPrice: booking.finalPrice,
            discount: booking.discount,
            quotationNumber: booking.quotationNumber,
            addonsJson: booking.addonsJson,
          }}
          onClose={() => setShowQuotation(false)}
        />
      )}
    </div>
  );
}
