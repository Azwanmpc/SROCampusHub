"use client";

import { useEffect, useMemo, useState } from "react";
import { MagnifyingGlass, X } from "@phosphor-icons/react";

type Aset = { id: string; namaAset: string; noPendaftaran: string; lokasi: string; status: string; sedangDipinjam: boolean };

const emptyForm = { jawatan: "", bahagian: "", tujuan: "", tempatDigunakan: "", tarikhDijangkaPulang: "" };

export default function PinjamanAsetForm({ onDone }: { onDone?: () => void }) {
  const [assets, setAssets] = useState<Aset[]>([]);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/aset")
      .then((r) => r.json())
      .then((data: Aset[]) => setAssets(Array.isArray(data) ? data : []));
  }, []);

  const available = useMemo(() => assets.filter((a) => a.status === "BAIK" && !a.sedangDipinjam), [assets]);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return available.slice(0, 40);
    return available
      .filter((a) => a.namaAset.toLowerCase().includes(q) || a.noPendaftaran.toLowerCase().includes(q) || a.lokasi.toLowerCase().includes(q))
      .slice(0, 40);
  }, [available, search]);

  const selectedAssets = useMemo(() => assets.filter((a) => selectedIds.has(a.id)), [assets, selectedIds]);

  function toggleAsset(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (selectedIds.size === 0) {
      setError("Sila cari dan pilih sekurang-kurangnya satu aset untuk dipinjam");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/pinjaman-aset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, asetIds: Array.from(selectedIds) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Permohonan gagal");
        return;
      }
      setSuccess(true);
      setForm(emptyForm);
      setSelectedIds(new Set());
      setSearch("");
      onDone?.();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] p-5">
      <div className="mb-4 font-archivo text-sm font-extrabold">Borang Permohonan Pinjaman Aset</div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-[rgba(var(--ink-rgb),0.65)]">Jawatan</label>
          <input
            type="text"
            required
            value={form.jawatan}
            onChange={(e) => setForm((f) => ({ ...f, jawatan: e.target.value }))}
            className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] px-2.5 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[rgba(var(--ink-rgb),0.65)]">Bahagian</label>
          <input
            type="text"
            required
            value={form.bahagian}
            onChange={(e) => setForm((f) => ({ ...f, bahagian: e.target.value }))}
            className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] px-2.5 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[rgba(var(--ink-rgb),0.65)]">Tempat Digunakan</label>
          <input
            type="text"
            required
            value={form.tempatDigunakan}
            onChange={(e) => setForm((f) => ({ ...f, tempatDigunakan: e.target.value }))}
            className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] px-2.5 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[rgba(var(--ink-rgb),0.65)]">Tarikh Dijangka Pulang</label>
          <input
            type="date"
            required
            value={form.tarikhDijangkaPulang}
            onChange={(e) => setForm((f) => ({ ...f, tarikhDijangkaPulang: e.target.value }))}
            className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] px-2.5 py-1.5 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs text-[rgba(var(--ink-rgb),0.65)]">Tujuan</label>
          <textarea
            required
            rows={2}
            value={form.tujuan}
            onChange={(e) => setForm((f) => ({ ...f, tujuan: e.target.value }))}
            className="w-full border border-[rgba(var(--ink-rgb),0.4)] px-2.5 py-1.5 text-sm outline-none"
          />
        </div>
      </div>

      <div className="mb-2 border-t border-[rgba(var(--ink-rgb),0.15)] pt-3">
        <label className="mb-1.5 block text-xs font-bold text-[rgba(var(--ink-rgb),0.65)]">Cari &amp; Pilih Aset Untuk Dipinjam</label>
        <div className="relative">
          <MagnifyingGlass weight="bold" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[rgba(var(--ink-rgb),0.4)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama aset, no. pendaftaran atau lokasi..."
            className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] py-1.5 pl-8 pr-2.5 text-sm"
          />
        </div>

        <div className="mt-2 max-h-[220px] overflow-y-auto border border-[rgba(var(--ink-rgb),0.25)]">
          {results.length === 0 ? (
            <div className="px-3 py-4 text-center text-xs text-[rgba(var(--ink-rgb),0.5)]">Tiada aset sepadan atau tersedia untuk dipinjam</div>
          ) : (
            results.map((a) => (
              <label
                key={a.id}
                className="flex cursor-pointer items-center justify-between gap-3 border-b border-[rgba(var(--ink-rgb),0.1)] px-3 py-2 text-[12.5px] last:border-b-0 hover:bg-[#f7f6f6]"
              >
                <div className="flex items-center gap-2.5">
                  <input type="checkbox" checked={selectedIds.has(a.id)} onChange={() => toggleAsset(a.id)} />
                  <div>
                    <div className="font-bold">{a.namaAset}</div>
                    <div className="text-[rgba(var(--ink-rgb),0.55)]">
                      {a.noPendaftaran || "Tiada no. pendaftaran"} &middot; {a.lokasi}
                    </div>
                  </div>
                </div>
              </label>
            ))
          )}
        </div>
      </div>

      {selectedAssets.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {selectedAssets.map((a) => (
            <span key={a.id} className="flex items-center gap-1.5 bg-[var(--surface)] px-2.5 py-1 text-[11.5px] font-bold">
              {a.namaAset}
              <button type="button" onClick={() => toggleAsset(a.id)} aria-label={`Buang ${a.namaAset}`}>
                <X weight="bold" size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {error && <div className="mb-3 bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger)]">{error}</div>}
      {success && <div className="mb-3 bg-[var(--success-bg)] px-3 py-2 text-sm text-[#1c5c37]">Permohonan pinjaman aset telah dihantar dan menunggu kelulusan.</div>}

      <button
        type="submit"
        disabled={saving}
        className="bg-[#6d28d9] px-5 py-2.5 font-archivo text-[13px] font-extrabold text-white hover:bg-[#4c1d95] disabled:opacity-60"
      >
        {saving ? "Menghantar..." : "Hantar Permohonan"}
      </button>
    </form>
  );
}
