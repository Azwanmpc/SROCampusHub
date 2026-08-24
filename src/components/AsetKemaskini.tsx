"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Aset = { id: string; namaAset: string; noPendaftaran: string; tahun: string | null; lokasi: string; status: string };

const emptyForm = { namaAset: "", noPendaftaran: "", tahun: "", lokasi: "", status: "BAIK" };

export default function AsetKemaskini() {
  const [records, setRecords] = useState<Aset[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lokasiFilter, setLokasiFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  function load() {
    setLoading(true);
    fetch("/api/aset")
      .then((r) => r.json())
      .then((data) => {
        setRecords(data);
        setLoading(false);
      });
  }

  useEffect(load, []);

  const lokasiOptions = useMemo(() => Array.from(new Set(records.map((r) => r.lokasi))).sort(), [records]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records
      .filter((r) => lokasiFilter === "ALL" || r.lokasi === lokasiFilter)
      .filter((r) => statusFilter === "ALL" || r.status === statusFilter)
      .filter((r) => !q || r.namaAset.toLowerCase().includes(q) || r.noPendaftaran.toLowerCase().includes(q))
      .sort((a, b) => a.lokasi.localeCompare(b.lokasi) || a.namaAset.localeCompare(b.namaAset));
  }, [records, lokasiFilter, statusFilter, search]);

  function startEdit(r: Aset) {
    setEditingId(r.id);
    setForm({ namaAset: r.namaAset, noPendaftaran: r.noPendaftaran, tahun: r.tahun ?? "", lokasi: r.lokasi, status: r.status });
    setError("");
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.namaAset.trim()) {
      setError("Sila nyatakan nama aset");
      return;
    }
    if (!form.lokasi.trim()) {
      setError("Sila nyatakan lokasi");
      return;
    }
    setSaving(true);
    try {
      const body = {
        namaAset: form.namaAset.trim(),
        noPendaftaran: form.noPendaftaran.trim(),
        tahun: form.tahun.trim() || null,
        lokasi: form.lokasi.trim(),
        status: form.status,
      };
      const res = await fetch(editingId ? `/api/aset/${editingId}` : "/api/aset", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Gagal simpan rekod");
        return;
      }
      cancelEdit();
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Padam rekod aset ini?")) return;
    await fetch(`/api/aset/${id}`, { method: "DELETE" });
    if (editingId === id) cancelEdit();
    load();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Link href="/aset" className="border border-[rgba(var(--ink-rgb),0.4)] px-4 py-2 font-archivo text-[13px] font-extrabold text-[var(--ink)] hover:bg-[var(--surface)]">
          Kembali ke Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] p-5">
        <div className="mb-3 font-archivo text-sm font-extrabold">{editingId ? "Kemaskini Rekod Aset" : "Tambah Rekod Aset"}</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label className="mb-1 block text-xs text-[rgba(var(--ink-rgb),0.65)]">Nama Aset</label>
            <input
              type="text"
              required
              value={form.namaAset}
              onChange={(e) => setForm((f) => ({ ...f, namaAset: e.target.value.toUpperCase() }))}
              placeholder="cth: KERUSI MESYUARAT"
              className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-2.5 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[rgba(var(--ink-rgb),0.65)]">No. Pendaftaran</label>
            <input
              type="text"
              value={form.noPendaftaran}
              onChange={(e) => setForm((f) => ({ ...f, noPendaftaran: e.target.value }))}
              placeholder="cth: NPC/WS/44/2003"
              className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-2.5 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[rgba(var(--ink-rgb),0.65)]">Tahun</label>
            <input
              type="text"
              value={form.tahun}
              onChange={(e) => setForm((f) => ({ ...f, tahun: e.target.value }))}
              placeholder="cth: 2024"
              className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-2.5 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[rgba(var(--ink-rgb),0.65)]">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-2.5 py-1.5 text-sm"
            >
              <option value="BAIK">Baik</option>
              <option value="ROSAK">Rosak</option>
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="mb-1 block text-xs text-[rgba(var(--ink-rgb),0.65)]">Lokasi</label>
            <input
              type="text"
              required
              list="lokasi-options"
              value={form.lokasi}
              onChange={(e) => setForm((f) => ({ ...f, lokasi: e.target.value }))}
              placeholder="cth: Bilik Kaizen"
              className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-2.5 py-1.5 text-sm"
            />
            <datalist id="lokasi-options">
              {lokasiOptions.map((l) => (
                <option key={l} value={l} />
              ))}
            </datalist>
          </div>
        </div>

        {error && <div className="mt-3 bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger)]">{error}</div>}

        <div className="mt-4 flex gap-2.5">
          <button type="submit" disabled={saving} className="bg-[var(--accent)] px-5 py-2.5 font-archivo text-[13px] font-extrabold text-white hover:bg-[var(--accent-dark)] disabled:opacity-60">
            {saving ? "Menyimpan..." : editingId ? "Kemaskini" : "Simpan Rekod"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="border border-[rgba(var(--ink-rgb),0.4)] px-5 py-2.5 font-archivo text-[13px] font-extrabold text-[var(--ink)]">
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div>
          <label className="mr-1.5 text-[13px] font-bold text-[rgba(var(--ink-rgb),0.6)]">Lokasi:</label>
          <select value={lokasiFilter} onChange={(e) => setLokasiFilter(e.target.value)} className="border border-[rgba(var(--ink-rgb),0.3)] bg-[var(--white)] px-3 py-1.5 text-sm font-semibold">
            <option value="ALL">Semua Lokasi</option>
            {lokasiOptions.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-1.5 text-[13px] font-bold text-[rgba(var(--ink-rgb),0.6)]">Status:</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-[rgba(var(--ink-rgb),0.3)] bg-[var(--white)] px-3 py-1.5 text-sm font-semibold">
            <option value="ALL">Semua Status</option>
            <option value="BAIK">Baik</option>
            <option value="ROSAK">Rosak</option>
          </select>
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama aset / no. pendaftaran..."
          className="min-h-9 flex-1 border border-[rgba(var(--ink-rgb),0.3)] px-3 py-1.5 text-sm"
        />
        <div className="text-[12.5px] text-[rgba(var(--ink-rgb),0.55)]">{filtered.length} rekod</div>
      </div>

      {loading ? (
        <p className="text-sm text-[rgba(var(--ink-rgb),0.5)]">Memuatkan rekod...</p>
      ) : (
        <div className="max-h-[520px] overflow-auto border border-[rgba(var(--ink-rgb),0.3)]">
          <table className="w-full min-w-[820px] border-collapse text-[13px]">
            <thead>
              <tr className="sticky top-0 bg-[#1a1a1a] text-white">
                <th className="px-3 py-2 text-left font-semibold">Nama Aset</th>
                <th className="px-3 py-2 text-left font-semibold">No. Pendaftaran</th>
                <th className="px-3 py-2 text-left font-semibold">Tahun</th>
                <th className="px-3 py-2 text-left font-semibold">Lokasi</th>
                <th className="px-3 py-2 text-left font-semibold">Status</th>
                <th className="px-3 py-2 text-left font-semibold">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 400).map((r) => (
                <tr key={r.id} className="odd:bg-[var(--white)] even:bg-[var(--surface)]">
                  <td className="border-b border-[var(--surface)] px-3 py-2">{r.namaAset}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2 text-[rgba(var(--ink-rgb),0.6)]">{r.noPendaftaran || "—"}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2 text-[rgba(var(--ink-rgb),0.6)]">{r.tahun || "—"}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2">{r.lokasi}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold text-white ${r.status === "ROSAK" ? "bg-[#E4212B]" : "bg-[#16a34a]"}`}>
                      {r.status === "ROSAK" ? "Rosak" : "Baik"}
                    </span>
                  </td>
                  <td className="border-b border-[var(--surface)] px-3 py-2">
                    <button onClick={() => startEdit(r)} className="mr-3 font-bold text-[var(--accent)] hover:underline">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(r.id)} className="font-bold text-[var(--danger)] hover:underline">
                      Padam
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-sm text-[rgba(var(--ink-rgb),0.5)]">
                    Tiada rekod
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {filtered.length > 400 && (
            <div className="border-t border-[var(--surface)] px-3 py-2 text-center text-[11.5px] text-[rgba(var(--ink-rgb),0.5)]">
              Memaparkan 400 daripada {filtered.length} rekod &mdash; gunakan penapis/carian untuk tumpuan
            </div>
          )}
        </div>
      )}
    </div>
  );
}
