"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { COMPLAINT_STATUS_LABEL, REPAIR_TYPE_LABEL } from "@/lib/constants";

export default function ComplaintStatusControl({
  complaintId,
  status,
  repairType,
}: {
  complaintId: string;
  status: string;
  repairType: string | null;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  async function update(patch: { status?: string; repairType?: string }) {
    setSaving(true);
    try {
      await fetch(`/api/complaints/${complaintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={status}
        disabled={saving}
        onChange={(e) => update({ status: e.target.value })}
        className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold"
      >
        {Object.entries(COMPLAINT_STATUS_LABEL).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <select
        value={repairType ?? ""}
        disabled={saving}
        onChange={(e) => update({ repairType: e.target.value })}
        className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold"
      >
        <option value="">Jenis Pembaikan</option>
        {Object.entries(REPAIR_TYPE_LABEL).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
}
