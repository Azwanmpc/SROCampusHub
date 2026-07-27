"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "@phosphor-icons/react/dist/ssr";
import { FACILITY_STATUS_LABEL } from "@/lib/constants";

type Facility = {
  id: string;
  name: string;
  type: string;
  capacity: number;
  description: string | null;
  status: string;
  costPerUse: number;
  halfDayRate: number | null;
  fullDayRate: number | null;
};

export default function FacilityEditModal({
  facility,
  onClose,
}: {
  facility: Facility;
  onClose: () => void;
}) {
  const router = useRouter();
  const [description, setDescription] = useState(facility.description ?? "");
  const [status, setStatus] = useState(facility.status);
  const [costPerUse, setCostPerUse] = useState(String(facility.costPerUse ?? 0));
  const [halfDayRate, setHalfDayRate] = useState(facility.halfDayRate != null ? String(facility.halfDayRate) : "");
  const [fullDayRate, setFullDayRate] = useState(facility.fullDayRate != null ? String(facility.fullDayRate) : "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch(`/api/facilities/${facility.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          status,
          costPerUse: Number(costPerUse) || 0,
          halfDayRate: halfDayRate === "" ? null : Number(halfDayRate),
          fullDayRate: fullDayRate === "" ? null : Number(fullDayRate),
        }),
      });
      router.refresh();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(32,30,29,0.6)] p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto border border-[rgba(32,30,29,0.4)] bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-[rgba(32,30,29,0.4)] px-5 py-4">
          <div className="font-archivo text-base font-extrabold">Ubah Fasiliti: {facility.name}</div>
          <button onClick={onClose} className="text-[#201e1d]">
            <X weight="bold" size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div>
            <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.05em] text-[rgba(32,30,29,0.55)]">
              Ringkasan
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-[rgba(32,30,29,0.4)] px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.05em] text-[rgba(32,30,29,0.55)]">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-[rgba(32,30,29,0.4)] bg-white px-3 py-2 text-sm focus:outline-none"
            >
              {Object.entries(FACILITY_STATUS_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.05em] text-[rgba(32,30,29,0.55)]">
              Kadar (RM)
            </label>
            <input
              type="number"
              value={costPerUse}
              onChange={(e) => setCostPerUse(e.target.value)}
              className="w-full border border-[rgba(32,30,29,0.4)] px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.05em] text-[rgba(32,30,29,0.55)]">
                Separuh Hari (RM)
              </label>
              <input
                type="number"
                value={halfDayRate}
                onChange={(e) => setHalfDayRate(e.target.value)}
                placeholder="—"
                className="w-full border border-[rgba(32,30,29,0.4)] px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.05em] text-[rgba(32,30,29,0.55)]">
                Satu Hari (RM)
              </label>
              <input
                type="number"
                value={fullDayRate}
                onChange={(e) => setFullDayRate(e.target.value)}
                placeholder="—"
                className="w-full border border-[rgba(32,30,29,0.4)] px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t-2 border-[rgba(32,30,29,0.4)] px-5 py-4">
          <button
            onClick={onClose}
            className="border border-[rgba(32,30,29,0.4)] px-4 py-2 text-[13px] font-bold text-[#201e1d]"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#6d28d9] px-4 py-2 text-[13px] font-extrabold text-white hover:bg-[#4c1d95] disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
