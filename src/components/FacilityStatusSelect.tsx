"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FACILITY_STATUS_LABEL } from "@/lib/constants";

export default function FacilityStatusSelect({
  facilityId,
  status,
}: {
  facilityId: string;
  status: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  async function handleChange(newStatus: string) {
    setValue(newStatus);
    setSaving(true);
    try {
      await fetch(`/api/facilities/${facilityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <select
      value={value}
      disabled={saving}
      onChange={(e) => handleChange(e.target.value)}
      className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 focus:outline-none"
    >
      {Object.entries(FACILITY_STATUS_LABEL).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}
