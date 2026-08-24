"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Image as ImageIcon } from "@phosphor-icons/react/dist/ssr";
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
  imageUrl: string | null;
};

export default function FacilityEditModal({
  facility,
  onClose,
}: {
  facility: Facility;
  onClose: () => void;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [description, setDescription] = useState(facility.description ?? "");
  const [status, setStatus] = useState(facility.status);
  const [costPerUse, setCostPerUse] = useState(String(facility.costPerUse ?? 0));
  const [halfDayRate, setHalfDayRate] = useState(facility.halfDayRate != null ? String(facility.halfDayRate) : "");
  const [fullDayRate, setFullDayRate] = useState(facility.fullDayRate != null ? String(facility.fullDayRate) : "");
  const [imageUrl, setImageUrl] = useState(facility.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "facilities");
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error ?? "Muat naik gambar gagal");
        return;
      }
      setImageUrl(data.url);
    } finally {
      setUploading(false);
    }
  }

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
          imageUrl: imageUrl === "" ? null : imageUrl,
        }),
      });
      router.refresh();
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.6)] p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-y-auto border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-[rgba(var(--ink-rgb),0.4)] px-5 py-4">
          <div className="font-archivo text-base font-extrabold">Ubah Fasiliti: {facility.name}</div>
          <button onClick={onClose} className="text-[var(--ink)]">
            <X weight="bold" size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div>
            <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.05em] text-[rgba(var(--ink-rgb),0.55)]">
              Gambar Fasiliti
            </label>
            <div className="flex items-center gap-3 border border-dashed border-[rgba(var(--ink-rgb),0.5)] bg-[var(--surface)] p-3">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt="Pratonton fasiliti" className="h-14 w-14 flex-none object-cover" />
              ) : (
                <div className="flex h-14 w-14 flex-none items-center justify-center bg-[repeating-linear-gradient(135deg,#d7d3d3_0_8px,#bab6b6_8px_16px)] text-[#605d5d]">
                  <ImageIcon weight="duotone" size={20} />
                </div>
              )}
              <label className="cursor-pointer text-xs text-[rgba(var(--ink-rgb),0.6)]">
                <div className="font-mono font-bold">{uploading ? "Memuat naik..." : "Pilih gambar…"}</div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  disabled={uploading}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
            {uploadError && <div className="mt-1 text-xs text-[var(--danger)]">{uploadError}</div>}
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.05em] text-[rgba(var(--ink-rgb),0.55)]">
              Ringkasan
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-[rgba(var(--ink-rgb),0.4)] px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.05em] text-[rgba(var(--ink-rgb),0.55)]">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-3 py-2 text-sm focus:outline-none"
            >
              {Object.entries(FACILITY_STATUS_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.05em] text-[rgba(var(--ink-rgb),0.55)]">
              Kadar (RM)
            </label>
            <input
              type="number"
              value={costPerUse}
              onChange={(e) => setCostPerUse(e.target.value)}
              className="w-full border border-[rgba(var(--ink-rgb),0.4)] px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.05em] text-[rgba(var(--ink-rgb),0.55)]">
                Separuh Hari (RM)
              </label>
              <input
                type="number"
                value={halfDayRate}
                onChange={(e) => setHalfDayRate(e.target.value)}
                placeholder="—"
                className="w-full border border-[rgba(var(--ink-rgb),0.4)] px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-[0.05em] text-[rgba(var(--ink-rgb),0.55)]">
                Satu Hari (RM)
              </label>
              <input
                type="number"
                value={fullDayRate}
                onChange={(e) => setFullDayRate(e.target.value)}
                placeholder="—"
                className="w-full border border-[rgba(var(--ink-rgb),0.4)] px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t-2 border-[rgba(var(--ink-rgb),0.4)] px-5 py-4">
          <button
            onClick={onClose}
            className="border border-[rgba(var(--ink-rgb),0.4)] px-4 py-2 text-[13px] font-bold text-[var(--ink)]"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || uploading}
            className="bg-[var(--accent)] px-4 py-2 text-[13px] font-extrabold text-white hover:bg-[var(--accent-dark)] disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
}
