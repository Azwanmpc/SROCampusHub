"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Facility = { id: string; name: string };

export default function ComplaintForm({ facilities }: { facilities: Facility[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [facilityId, setFacilityId] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPreview(URL.createObjectURL(file));
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
        body: JSON.stringify({ facilityId, location, description, photoUrl }),
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
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Fasiliti Berkaitan (jika ada)</label>
        <select
          value={facilityId}
          onChange={(e) => setFacilityId(e.target.value)}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Tiada / Lain-lain</option>
          {facilities.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Lokasi</label>
        <input
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Cth: Asrama Blok A - Bilik A-12"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Butiran Kerosakan</label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nyatakan kerosakan secara ringkas"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Gambar Kerosakan</label>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-indigo-700"
        />
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Pratonton" className="mt-2 h-32 w-32 rounded-md object-cover" />
        )}
      </div>

      {error && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {success && (
        <div className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Aduan berjaya dihantar. Kami akan menyemak dalam masa terdekat.
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-indigo-700 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800 disabled:opacity-60"
      >
        {loading ? "Menghantar..." : "Hantar Aduan"}
      </button>
    </form>
  );
}
