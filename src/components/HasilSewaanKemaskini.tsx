"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Rec = { id: string; tarikh: string; organisasi: string; lokasi: string; bilanganPeserta: number; hasilTerimaan: number };

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm = { tarikh: todayStr(), organisasi: "", lokasi: "", bilanganPeserta: "", hasilTerimaan: "" };

export default function HasilSewaanKemaskini() {
  const [records, setRecords] = useState<Rec[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [yearFilter, setYearFilter] = useState<number | "ALL">("ALL");

  function load() {
    setLoading(true);
    fetch("/api/hasil-sewaan")
      .then((r) => r.json())
      .then((data) => {
        setRecords(data);
        setLoading(false);
      });
  }

  useEffect(load, []);

  const lokasiOptions = useMemo(() => Array.from(new Set(records.map((r) => r.lokasi))).sort(), [records]);
  const years = useMemo(() => Array.from(new Set(records.map((r) => new Date(r.tarikh).getFullYear()))).sort((a, b) => b - a), [records]);

  const filtered = useMemo(() => {
    const list = yearFilter === "ALL" ? records : records.filter((r) => new Date(r.tarikh).getFullYear() === yearFilter);
    return [...list].sort((a, b) => new Date(b.tarikh).getTime() - new Date(a.tarikh).getTime());
  }, [records, yearFilter]);

  function startEdit(r: Rec) {
    setEditingId(r.id);
    setForm({
      tarikh: r.tarikh.slice(0, 10),
      organisasi: r.organisasi,
      lokasi: r.lokasi,
      bilanganPeserta: String(r.bilanganPeserta),
      hasilTerimaan: String(r.hasilTerimaan),
    });
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
    if (!form.organisasi.trim()) {
      setError("Sila nyatakan organisasi");
      return;
    }
    if (!form.lokasi.trim()) {
      setError("Sila nyatakan lokasi / kemudahan");
      return;
    }
    setSaving(true);
    try {
      const body = {
        tarikh: form.tarikh,
        organisasi: form.organisasi.trim(),
        lokasi: form.lokasi.trim().toUpperCase(),
        bilanganPeserta: form.bilanganPeserta,
        hasilTerimaan: form.hasilTerimaan,
      };
      const res = await fetch(editingId ? `/api/hasil-sewaan/${editingId}` : "/api/hasil-sewaan", {
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
    await fetch(`/api/hasil-sewaan/${id}`, { method: "DELETE" });
    if (editingId === id) cancelEdit();
    load();
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Link href="/hasil-sewaan" className="border border-[rgba(var(--ink-rgb),0.4)] px-4 py-2 font-archivo text-[13px] font-extrabold text-[var(--ink)] hover:bg-[#f7f6f6]">
          Kembali ke Dashboard
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] p-5">
        <div className="mb-3 font-archivo text-sm font-extrabold">{editingId ? "Kemaskini Rekod Sewaan" : "Tambah Rekod Sewaan"}</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs text-[rgba(var(--ink-rgb),0.65)]">Tarikh</label>
            <input
              type="date"
              required
              value={form.tarikh}
              onChange={(e) => setForm((f) => ({ ...f, tarikh: e.target.value }))}
              className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] px-2.5 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[rgba(var(--ink-rgb),0.65)]">Organisasi</label>
            <input
              type="text"
              required
              value={form.organisasi}
              onChange={(e) => setForm((f) => ({ ...f, organisasi: e.target.value }))}
              placeholder="cth: Jabatan XYZ"
              className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] px-2.5 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[rgba(var(--ink-rgb),0.65)]">Lokasi / Kemudahan</label>
            <input
              type="text"
              required
              list="lokasi-options"
              value={form.lokasi}
              onChange={(e) => setForm((f) => ({ ...f, lokasi: e.target.value.toUpperCase() }))}
              placeholder="cth: ICC"
              className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] px-2.5 py-1.5 text-sm"
            />
            <datalist id="lokasi-options">
              {lokasiOptions.map((j) => (
                <option key={j} value={j} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[rgba(var(--ink-rgb),0.65)]">Bilangan Peserta</label>
            <input
              type="number"
              step="0.01"
              value={form.bilanganPeserta}
              onChange={(e) => setForm((f) => ({ ...f, bilanganPeserta: e.target.value }))}
              className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] px-2.5 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[rgba(var(--ink-rgb),0.65)]">Hasil Terimaan (RM)</label>
            <input
              type="number"
              step="0.01"
              value={form.hasilTerimaan}
              onChange={(e) => setForm((f) => ({ ...f, hasilTerimaan: e.target.value }))}
              className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] px-2.5 py-1.5 text-sm"
            />
          </div>
        </div>

        {error && <div className="mt-3 bg-[var(--danger-bg)] px-3 py-2 text-sm text-[var(--danger)]">{error}</div>}

        <div className="mt-4 flex gap-2.5">
          <button type="submit" disabled={saving} className="bg-[#6d28d9] px-5 py-2.5 font-archivo text-[13px] font-extrabold text-white hover:bg-[#4c1d95] disabled:opacity-60">
            {saving ? "Menyimpan..." : editingId ? "Kemaskini" : "Simpan Rekod"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="border border-[rgba(var(--ink-rgb),0.4)] px-5 py-2.5 font-archivo text-[13px] font-extrabold text-[var(--ink)]">
              Batal
            </button>
          )}
        </div>
      </form>

      <div className="mb-3 flex items-center gap-2">
        <label className="text-[13px] font-bold text-[rgba(var(--ink-rgb),0.6)]">Tapis Tahun:</label>
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
          className="border border-[rgba(var(--ink-rgb),0.3)] px-3 py-1.5 text-sm font-semibold"
        >
          <option value="ALL">Semua Tahun</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-sm text-[rgba(var(--ink-rgb),0.5)]">Memuatkan rekod...</p>
      ) : (
        <div className="max-h-[520px] overflow-auto border border-[rgba(var(--ink-rgb),0.3)]">
          <table className="w-full min-w-[760px] border-collapse text-[13px]">
            <thead>
              <tr className="sticky top-0 bg-[#1a1a1a] text-white">
                <th className="px-3 py-2 text-left font-semibold">Tarikh</th>
                <th className="px-3 py-2 text-left font-semibold">Organisasi</th>
                <th className="px-3 py-2 text-left font-semibold">Lokasi</th>
                <th className="px-3 py-2 text-right font-semibold">Peserta</th>
                <th className="px-3 py-2 text-right font-semibold">Hasil (RM)</th>
                <th className="px-3 py-2 text-left font-semibold">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="odd:bg-[var(--white)] even:bg-[#fafbfd]">
                  <td className="border-b border-[#eef0f4] px-3 py-2">{new Date(r.tarikh).toLocaleDateString("ms-MY")}</td>
                  <td className="border-b border-[#eef0f4] px-3 py-2">{r.organisasi}</td>
                  <td className="border-b border-[#eef0f4] px-3 py-2 font-bold">{r.lokasi}</td>
                  <td className="border-b border-[#eef0f4] px-3 py-2 text-right">{r.bilanganPeserta.toLocaleString("en-US")}</td>
                  <td className="border-b border-[#eef0f4] px-3 py-2 text-right">{r.hasilTerimaan.toLocaleString("en-US")}</td>
                  <td className="border-b border-[#eef0f4] px-3 py-2">
                    <button onClick={() => startEdit(r)} className="mr-3 font-bold text-[#6d28d9] hover:underline">
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
        </div>
      )}
    </div>
  );
}
