"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WarningCircle, Wrench, Hourglass, CheckCircle, Trash } from "@phosphor-icons/react";
import {
  COMPLAINT_STATUS_LABEL,
  COMPLAINT_STATUS_COLOR,
  PRIORITY_LABEL,
  PRIORITY_COLOR,
  REPAIR_TYPE_LABEL,
  COMPLAINT_CATEGORY_LABEL,
} from "@/lib/constants";

type Complaint = {
  id: string;
  location: string;
  description: string;
  photoUrl: string | null;
  status: string;
  priority: string;
  repairType: string | null;
  category: string | null;
  staffNote: string | null;
  estimatedCost: number;
  createdAt: string;
  user: { name: string } | null;
  guestName: string | null;
};

function daysBetween(a: Date, b: Date) {
  return Math.max(0, Math.round((b.getTime() - a.getTime()) / 86400000));
}

const STATUS_ICON: Record<string, typeof WarningCircle> = {
  BARU: WarningCircle,
  DALAM_TINDAKAN: Wrench,
  MENUNGGU_PENGESAHAN: Hourglass,
  SELESAI: CheckCircle,
};

const STATUS_ICON_COLOR: Record<string, string> = {
  BARU: "var(--info)",
  DALAM_TINDAKAN: "var(--warning)",
  MENUNGGU_PENGESAHAN: "var(--danger)",
  SELESAI: "var(--success)",
};

export default function ComplaintCard({
  complaint,
  role,
  onDelete,
}: {
  complaint: Complaint;
  role: string;
  onDelete?: (id: string) => void;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [staffNote, setStaffNote] = useState(complaint.staffNote ?? "");
  const [category, setCategory] = useState(complaint.category ?? "");

  const canApprove = role === "SUPERADMIN" || role === "ADMIN";
  const isStaffWorker = role === "TEKNIKAL" || canApprove;
  const isPengadu = role === "PENGADU";
  const hariPending = daysBetween(new Date(complaint.createdAt), new Date());
  const StatusIcon = STATUS_ICON[complaint.status] ?? WarningCircle;

  async function callAction(action: string, extra?: Record<string, unknown>) {
    setLoading(true);
    try {
      await fetch(`/api/complaints/${complaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function saveStaffFields() {
    setLoading(true);
    try {
      await fetch(`/api/complaints/${complaint.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffNote }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[var(--white)] p-4">
      <div className="flex flex-wrap items-start gap-3.5">
        <StatusIcon weight="duotone" size={22} className="flex-none" style={{ color: STATUS_ICON_COLOR[complaint.status] ?? STATUS_ICON_COLOR.BARU }} />
        <div className="min-w-[220px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[14.5px] font-bold">{complaint.location}</div>
            <span className={`text-[10px] font-bold uppercase tracking-[0.03em] px-2 py-0.5 ${PRIORITY_COLOR[complaint.priority]}`}>
              {PRIORITY_LABEL[complaint.priority]}
            </span>
            {complaint.category && (
              <span className="bg-[#eae7e7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.03em] text-[#605d5d]">
                {COMPLAINT_CATEGORY_LABEL[complaint.category] ?? complaint.category}
              </span>
            )}
          </div>
          <div className="mt-0.5 text-[12.5px] text-[rgba(var(--ink-rgb),0.6)]">{complaint.description}</div>
          <div className="mt-1 text-xs text-[rgba(var(--ink-rgb),0.6)]">
            Pengadu: {complaint.user?.name ?? complaint.guestName ?? "Awam"}
            {complaint.repairType && ` · ${REPAIR_TYPE_LABEL[complaint.repairType]}`}
          </div>
          <div className="mt-0.5 text-xs text-[rgba(var(--ink-rgb),0.6)]">
            Tarikh Aduan: {new Date(complaint.createdAt).toLocaleDateString("ms-MY")}
          </div>
          {complaint.photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={complaint.photoUrl} alt="Gambar aduan" className="mt-2 h-28 w-28 object-cover" />
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <StatusBadgeInline status={complaint.status} />
          {complaint.status !== "SELESAI" && (
            <div className="text-[11px] font-bold text-[var(--accent)]">{hariPending} hari pending</div>
          )}
        </div>
      </div>

      {isStaffWorker && complaint.status === "DALAM_TINDAKAN" && (
        <div className="mt-3 border-t border-[rgba(var(--ink-rgb),0.2)] pt-3">
          <label className="mb-1 block text-[11px] font-bold text-[rgba(var(--ink-rgb),0.6)]">Catatan Staf</label>
          <textarea
            value={staffNote}
            onChange={(e) => setStaffNote(e.target.value)}
            onBlur={saveStaffFields}
            rows={2}
            placeholder="Tambah catatan kerja penyelenggaraan…"
            className="w-full border border-[rgba(var(--ink-rgb),0.3)] bg-[var(--surface)] px-2.5 py-2 text-xs outline-none"
          />
          {role === "TEKNIKAL" && (
            <button
              onClick={() => callAction("TANDAKAN_SIAP")}
              disabled={loading}
              className="mt-3 flex items-center gap-1.5 bg-[var(--accent)] px-3.5 py-2 font-archivo text-[12.5px] font-extrabold text-[#f3f2f2] disabled:opacity-60"
            >
              <CheckCircle weight="duotone" /> Tandakan Siap
            </button>
          )}
        </div>
      )}

      {canApprove && complaint.status === "BARU" && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[rgba(var(--ink-rgb),0.2)] pt-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-2.5 py-2 text-[12.5px] font-bold"
          >
            <option value="">Jenis Kerosakan…</option>
            {Object.entries(COMPLAINT_CATEGORY_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <button
            onClick={() => callAction("AMBIL_DALAMAN", { category: category || undefined })}
            disabled={loading}
            className="border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--surface)] px-3.5 py-2 text-[12.5px] font-bold disabled:opacity-60"
          >
            Tindakan (Dalaman)
          </button>
          <button
            onClick={() => callAction("AMBIL_KONTRAKTOR", { category: category || undefined })}
            disabled={loading}
            className="border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--surface)] px-3.5 py-2 text-[12.5px] font-bold disabled:opacity-60"
          >
            Tindakan (Kontraktor)
          </button>
        </div>
      )}

      {canApprove && complaint.status === "MENUNGGU_PENGESAHAN" && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[rgba(var(--ink-rgb),0.2)] pt-3">
          <div className="mb-0.5 w-full text-[11.5px] text-[rgba(var(--ink-rgb),0.6)]">
            Staf penyelenggaraan telah tandakan siap — sila sahkan
          </div>
          <button
            onClick={() => callAction("SAHKAN_SIAP")}
            disabled={loading}
            className="flex items-center gap-1.5 bg-[#4a8a63] px-3.5 py-2 font-archivo text-[12.5px] font-extrabold text-[#f3f2f2] disabled:opacity-60"
          >
            <CheckCircle weight="duotone" /> Sahkan Siap
          </button>
          <button
            onClick={() => callAction("HANTAR_BALIK")}
            disabled={loading}
            className="border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--surface)] px-3.5 py-2 text-[12.5px] font-bold disabled:opacity-60"
          >
            Hantar Balik
          </button>
        </div>
      )}

      {(isPengadu || canApprove) && onDelete && (
        <div className="mt-2.5 flex justify-end">
          <button
            onClick={() => onDelete(complaint.id)}
            className="flex items-center gap-1.5 border border-[var(--accent)] px-3 py-1.5 text-xs font-bold text-[var(--accent)]"
          >
            <Trash weight="duotone" /> Padam
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadgeInline({ status }: { status: string }) {
  return (
    <span className={`whitespace-nowrap px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.03em] ${COMPLAINT_STATUS_COLOR[status]}`}>
      {COMPLAINT_STATUS_LABEL[status]}
    </span>
  );
}
