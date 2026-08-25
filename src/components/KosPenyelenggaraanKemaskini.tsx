"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { DownloadSimple, UploadSimple } from "@phosphor-icons/react";
import { KOS_LOKASI_LABEL, KOS_JENIS_LABEL, KOS_KATEGORI_LABEL, REPAIR_TYPE_LABEL } from "@/lib/constants";
import { downloadTemplate, parseUploadedFile, type BulkUploadResult } from "@/lib/bulkUpload";

type Rec = {
  id: string;
  tarikh: string;
  lokasi: string;
  perincianLokasi: string | null;
  jenis: string;
  butiranKerja: string;
  kos: number;
  tugasDilaksanakan: string;
  kategori: string;
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm = {
  tarikh: todayStr(),
  lokasi: "",
  perincianLokasi: "",
  jenis: "",
  butiranKerja: "",
  kos: "",
  tugasDilaksanakan: "",
  kategori: "",
};

export default function KosPenyelenggaraanKemaskini() {
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
    fetch("/api/kos-penyelenggaraan")
      .then((r) => r.json())
      .then((data) => {
        setRecords(data);
        setLoading(false);
      });
  }

  useEffect(load, []);

  const years = useMemo(() => Array.from(new Set(records.map((r) => new Date(r.tarikh).getFullYear()))).sort((a, b) => b - a), [records]);

  const filtered = useMemo(() => {
    const list = yearFilter === "ALL" ? records : records.filter((r) => new Date(r.tarikh).getFullYear() === yearFilter);
    return [...list].sort((a, b) => new Date(b.tarikh).getTime() - new Date(a.tarikh).getTime());
  }, [records, yearFilter]);

  function startEdit(r: Rec) {
    setEditingId(r.id);
    setForm({
      tarikh: r.tarikh.slice(0, 10),
      lokasi: r.lokasi,
      perincianLokasi: r.perincianLokasi ?? "",
      jenis: r.jenis,
      butiranKerja: r.butiranKerja,
      kos: String(r.kos),
      tugasDilaksanakan: r.tugasDilaksanakan,
      kategori: r.kategori,
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
    if (!form.lokasi) {
      setError("Sila pilih lokasi");
      return;
    }
    if (!form.jenis) {
      setError("Sila pilih jenis kerja");
      return;
    }
    if (!form.butiranKerja.trim()) {
      setError("Sila nyatakan butiran kerja");
      return;
    }
    if (!form.tugasDilaksanakan) {
      setError("Sila pilih tugas dilaksanakan");
      return;
    }
    if (!form.kategori) {
      setError("Sila pilih kategori");
      return;
    }
    setSaving(true);
    try {
      const body = {
        tarikh: form.tarikh,
        lokasi: form.lokasi,
        perincianLokasi: form.perincianLokasi.trim() || null,
        jenis: form.jenis,
        butiranKerja: form.butiranKerja.trim(),
        kos: form.kos,
        tugasDilaksanakan: form.tugasDilaksanakan,
        kategori: form.kategori,
      };
      const res = await fetch(editingId ? `/api/kos-penyelenggaraan/${editingId}` : "/api/kos-penyelenggaraan", {
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
      ["Tarikh", "Lokasi", "Perincian Lokasi", "Jenis", "Kategori", "Tugas Dilaksanakan", "Butiran Kerja", "Kos (RM)"],
      ["2024-01-15", Object.values(KOS_LOKASI_LABEL)[0], "Bilik Latihan ICC 1", Object.values(KOS_JENIS_LABEL)[0], Object.values(KOS_KATEGORI_LABEL)[0], Object.values(REPAIR_TYPE_LABEL)[0], "Baik pulih suis lampu", 250],
      "Templat-Kos-Penyelenggaraan.xlsx"
    );
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const rows = await parseUploadedFile(file);
      const res = await fetch("/api/kos-penyelenggaraan/bulk", {
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
    if (!confirm("Padam rekod ini?")) return;
    await fetch(`/api/kos-penyelenggaraan/${id}`, { method: "DELETE" });
    if (editingId === id) cancelEdit();
    load();
  }

  const fieldClass = "min-h-9 w-full border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-2.5 py-1.5 text-sm";
  const labelClass = "mb-1 block text-xs text-[rgba(var(--ink-rgb),0.65)]";

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
        <Link href="/kos-penyelenggaraan" className="bg-[var(--accent)] px-4 py-2 font-archivo text-[13px] font-extrabold text-white hover:bg-[var(--accent-dark)]">
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
        <div className="mb-3 font-archivo text-sm font-extrabold">{editingId ? "Kemaskini Rekod Kos Penyelenggaraan" : "Tambah Rekod Kos Penyelenggaraan"}</div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelClass}>Tarikh</label>
            <input
              type="date"
              required
              value={form.tarikh}
              onChange={(e) => setForm((f) => ({ ...f, tarikh: e.target.value }))}
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Lokasi</label>
            <select value={form.lokasi} onChange={(e) => setForm((f) => ({ ...f, lokasi: e.target.value }))} className={fieldClass}>
              <option value="">Pilih lokasi…</option>
              {Object.entries(KOS_LOKASI_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Perincian Lokasi (pilihan)</label>
            <input
              type="text"
              value={form.perincianLokasi}
              onChange={(e) => setForm((f) => ({ ...f, perincianLokasi: e.target.value }))}
              placeholder="cth: Bilik Latihan ICC 1"
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Jenis</label>
            <select value={form.jenis} onChange={(e) => setForm((f) => ({ ...f, jenis: e.target.value }))} className={fieldClass}>
              <option value="">Pilih jenis…</option>
              {Object.entries(KOS_JENIS_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Kategori</label>
            <select value={form.kategori} onChange={(e) => setForm((f) => ({ ...f, kategori: e.target.value }))} className={fieldClass}>
              <option value="">Pilih kategori…</option>
              {Object.entries(KOS_KATEGORI_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Tugas Dilaksanakan</label>
            <select value={form.tugasDilaksanakan} onChange={(e) => setForm((f) => ({ ...f, tugasDilaksanakan: e.target.value }))} className={fieldClass}>
              <option value="">Pilih…</option>
              {Object.entries(REPAIR_TYPE_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Kos (RM)</label>
            <input
              type="number"
              step="0.01"
              value={form.kos}
              onChange={(e) => setForm((f) => ({ ...f, kos: e.target.value }))}
              className={fieldClass}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <label className={labelClass}>Butiran Kerja</label>
            <textarea
              rows={2}
              value={form.butiranKerja}
              onChange={(e) => setForm((f) => ({ ...f, butiranKerja: e.target.value }))}
              placeholder="Nyatakan kerja penyelenggaraan / pembaikan yang dijalankan"
              className={`${fieldClass} resize-y`}
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
          <table className="w-full min-w-[900px] border-collapse text-[13px]">
            <thead>
              <tr className="sticky top-0 bg-[#1a1a1a] text-white">
                <th className="px-3 py-2 text-left font-semibold">Tarikh</th>
                <th className="px-3 py-2 text-left font-semibold">Lokasi</th>
                <th className="px-3 py-2 text-left font-semibold">Kategori</th>
                <th className="px-3 py-2 text-left font-semibold">Jenis</th>
                <th className="px-3 py-2 text-left font-semibold">Tugas</th>
                <th className="px-3 py-2 text-right font-semibold">Kos (RM)</th>
                <th className="px-3 py-2 text-left font-semibold">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="odd:bg-[var(--white)] even:bg-[var(--surface)]">
                  <td className="border-b border-[var(--surface)] px-3 py-2">{new Date(r.tarikh).toLocaleDateString("ms-MY")}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2 font-bold">
                    {KOS_LOKASI_LABEL[r.lokasi] ?? r.lokasi}
                    {r.perincianLokasi && <div className="text-[11px] font-normal text-[rgba(var(--ink-rgb),0.55)]">{r.perincianLokasi}</div>}
                  </td>
                  <td className="border-b border-[var(--surface)] px-3 py-2">{KOS_KATEGORI_LABEL[r.kategori] ?? r.kategori}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2">{KOS_JENIS_LABEL[r.jenis] ?? r.jenis}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2">{REPAIR_TYPE_LABEL[r.tugasDilaksanakan] ?? r.tugasDilaksanakan}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2 text-right">{r.kos.toLocaleString("en-US")}</td>
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
                  <td colSpan={7} className="px-3 py-6 text-center text-sm text-[rgba(var(--ink-rgb),0.5)]">
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
