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
      className="border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-2 py-1 text-xs font-bold text-[var(--ink)] focus:outline-none"
    >
      {Object.entries(FACILITY_STATUS_LABEL).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}
