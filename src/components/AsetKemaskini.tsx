"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { DownloadSimple, UploadSimple } from "@phosphor-icons/react";
import { downloadTemplate, parseUploadedFile, type BulkUploadResult } from "@/lib/bulkUpload";

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
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleTemplateDownload() {
    downloadTemplate(
      ["Nama Aset", "No. Pendaftaran", "Tahun", "Lokasi", "Status"],
      ["KERUSI MESYUARAT", "NPC/WS/44/2003", "2024", "Bilik Kaizen", "BAIK"],
      "Templat-Aset.xlsx"
    );
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadResult(null);
    try {
      const rows = await parseUploadedFile(file);
      const res = await fetch("/api/aset/bulk", {
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
    if (!confirm("Padam rekod aset ini?")) return;
    await fetch(`/api/aset/${id}`, { method: "DELETE" });
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
        <Link href="/aset" className="bg-[var(--accent)] px-4 py-2 font-archivo text-[13px] font-extrabold text-white hover:bg-[var(--accent-dark)]">
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
