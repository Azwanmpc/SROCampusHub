"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { DownloadSimple, UploadSimple } from "@phosphor-icons/react";
import { downloadTemplate, parseUploadedFile, type BulkUploadResult } from "@/lib/bulkUpload";

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
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleTemplateDownload() {
    downloadTemplate(
      ["Tarikh", "Organisasi", "Lokasi", "Bilangan Peserta", "Hasil Terimaan (RM)"],
      ["2024-01-15", "Jabatan XYZ", "ICC", 30, 1500],
      "Templat-Hasil-Sewaan.xlsx"
    );
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const rows = await parseUploadedFile(file);
      const res = await fetch("/api/hasil-sewaan/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      setUploadResult(data);
      load();
    } catch {
      setUploadResult({ success: 0, errors: [{ row: 0, message: "Gagal membaca fail. Pastikan format .xlsx atau .csv" }] });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/hasil-sewaan/${id}`, { method: "DELETE" });
    if (editingId === id) cancelEdit();
    load();
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap justify-end gap-2.5">
        <button
          onClick={handleTemplateDownload}
          className="flex items-center gap-1.5 border border-[rgba(var(--ink-rgb),0.4)] px-4 py-2 font-archivo text-[13px] font-extrabold text-[var(--ink)] hover:bg-[var(--surface)]"
        >
          <DownloadSimple weight="duotone" /> Muat Turun Templat
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 border border-[rgba(var(--ink-rgb),0.4)] px-4 py-2 font-archivo text-[13px] font-extrabold text-[var(--ink)] hover:bg-[var(--surface)] disabled:opacity-60"
        >
          <UploadSimple weight="duotone" /> {uploading ? "Memuat naik..." : "Muat Naik Fail"}
        </button>
        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} className="hidden" />
        <Link href="/hasil-sewaan" className="border border-[rgba(var(--ink-rgb),0.4)] px-4 py-2 font-archivo text-[13px] font-extrabold text-[var(--ink)] hover:bg-[var(--surface)]">
          Kembali ke Dashboard
        </Link>
      </div>

      {uploadResult && (
        <div className="mb-4 border border-[rgba(var(--ink-rgb),0.3)] bg-[var(--surface)] p-3.5 text-sm">
          <div className="font-bold text-[var(--success)]">{uploadResult.success} rekod berjaya ditambah.</div>
          {uploadResult.errors.length > 0 && (
            <div className="mt-2">
              <div className="font-bold text-[var(--danger)]">{uploadResult.errors.length} baris gagal:</div>
              <ul className="mt-1 list-disc pl-5 text-[rgba(var(--ink-rgb),0.7)]">
                {uploadResult.errors.slice(0, 20).map((err, i) => (
                  <li key={i}>Baris {err.row}: {err.message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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
              className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-2.5 py-1.5 text-sm"
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
              className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-2.5 py-1.5 text-sm"
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
              className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-2.5 py-1.5 text-sm"
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
              className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-2.5 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[rgba(var(--ink-rgb),0.65)]">Hasil Terimaan (RM)</label>
            <input
              type="number"
              step="0.01"
              value={form.hasilTerimaan}
              onChange={(e) => setForm((f) => ({ ...f, hasilTerimaan: e.target.value }))}
              className="min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-2.5 py-1.5 text-sm"
            />
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

      <div className="mb-3 flex items-center gap-2">
        <label className="text-[13px] font-bold text-[rgba(var(--ink-rgb),0.6)]">Tapis Tahun:</label>
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value === "ALL" ? "ALL" : Number(e.target.value))}
          className="border border-[rgba(var(--ink-rgb),0.3)] bg-[var(--white)] px-3 py-1.5 text-sm font-semibold"
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
                <tr key={r.id} className="odd:bg-[var(--white)] even:bg-[var(--surface)]">
                  <td className="border-b border-[var(--surface)] px-3 py-2">{new Date(r.tarikh).toLocaleDateString("ms-MY")}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2">{r.organisasi}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2 font-bold">{r.lokasi}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2 text-right">{r.bilanganPeserta.toLocaleString("en-US")}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2 text-right">{r.hasilTerimaan.toLocaleString("en-US")}</td>
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
        </div>
      )}
    </div>
  );
}
