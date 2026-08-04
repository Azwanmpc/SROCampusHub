"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Image as ImageIcon } from "@phosphor-icons/react";

type Facility = { id: string; name: string };

const fieldClass = "min-h-9 w-full border border-[rgba(32,30,29,0.4)] bg-[#f3f2f2] px-2.5 py-1.5 text-sm text-[#201e1d] outline-none";
const labelClass = "mb-[5px] block text-xs text-[rgba(32,30,29,0.7)]";

export default function ComplaintForm({
  facilities,
  role,
  guest = false,
}: {
  facilities: Facility[];
  role?: string;
  guest?: boolean;
}) {
  const locationRequired = !guest && role !== "PENGADU";
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [facilityId, setFacilityId] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("SEDERHANA");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setFileName(file.name);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      let photoUrl: string | null = null;
      const file = fileRef.current?.files?.[0];
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setError(uploadData.error ?? "Muat naik gambar gagal");
          return;
        }
        photoUrl = uploadData.url;
      }

      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ facilityId, location, description, priority, photoUrl, guestName, guestPhone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Aduan gagal dihantar");
        return;
      }
      setSuccess(true);
      setLocation("");
      setDescription("");
      setPreview(null);
      setFileName("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {guest && (
        <>
          <div>
            <label className={labelClass}>Nama Pengadu</label>
            <input
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Nama penuh"
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>No. Telefon (pilihan)</label>
            <input
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              placeholder="cth: 012-3456789"
              className={fieldClass}
            />
          </div>
        </>
      )}

      <div>
        <label className={labelClass}>Fasiliti Berkaitan (jika ada)</label>
        <select value={facilityId} onChange={(e) => setFacilityId(e.target.value)} className={fieldClass}>
          <option value="">Tiada / Lain-lain</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={labelClass}>Lokasi{!locationRequired && " (pilihan)"}</label>
        <input
          required={locationRequired}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Cth: Asrama Blok A - Bilik A-12"
          className={fieldClass}
        />
      </div>

      <div>
        <label className={labelClass}>Butiran Kerosakan</label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nyatakan kerosakan secara ringkas"
          className={`${fieldClass} resize-vertical`}
        />
      </div>

      <div>
        <label className={labelClass}>Tahap Keutamaan</label>
        <select value={priority} onChange={(e) => setPriority(e.target.value)} className={fieldClass}>
          <option value="TINGGI">Tinggi</option>
          <option value="SEDERHANA">Sederhana</option>
          <option value="RENDAH">Rendah</option>
        </select>
      </div>

      <div>
        <label className={labelClass}>Gambar Kerosakan</label>
        <div className="flex items-center gap-3 border border-dashed border-[rgba(32,30,29,0.5)] bg-[#f3f2f2] p-3.5">
          <div className="flex h-14 w-14 flex-none items-center justify-center bg-[repeating-linear-gradient(135deg,#d7d3d3_0_8px,#bab6b6_8px_16px)] text-[#605d5d]">
            <ImageIcon weight="duotone" size={20} />
          </div>
          <label className="cursor-pointer text-xs text-[rgba(32,30,29,0.6)]">
            <div className="font-mono font-bold">{fileName || "Pilih gambar…"}</div>
            Diambil terus dari kamera telefon
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Pratonton" className="mt-2 h-32 w-32 object-cover" />
        )}
      </div>

      {error && <div className="bg-[#fff2ef] px-3 py-2 text-sm text-[#7c1405]">{error}</div>}
      {success && (
        <div className="bg-[#e6f0e9] px-3 py-2 text-sm text-[#4a8a63]">
          Aduan berjaya dihantar. Kami akan menyemak dalam masa terdekat.
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-[#6d28d9] py-3 text-left font-archivo text-sm font-extrabold text-[#f3f2f2] hover:bg-[#4c1d95] disabled:opacity-60"
      >
        {loading ? "Menghantar..." : "Hantar Aduan"}
      </button>
    </form>
  );
}
