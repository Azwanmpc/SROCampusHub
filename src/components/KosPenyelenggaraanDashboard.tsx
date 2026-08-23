"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Chart, registerables } from "chart.js";
import { KOS_LOKASI_LABEL, KOS_JENIS_LABEL, KOS_KATEGORI_LABEL } from "@/lib/constants";

Chart.register(...registerables);

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

const MONTH_ORDER = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
const KATEGORI_COLORS = ["#E4212B", "#1e3a5f", "#0d9488", "#f59e0b", "#7c3aed", "#16a34a", "#db2777", "#2563eb", "#94a3b8"];

function fmtRM(n: number) {
  return "RM " + Math.round(n).toLocaleString("en-US");
}

export default function KosPenyelenggaraanDashboard({ canEdit }: { canEdit: boolean }) {
  const [records, setRecords] = useState<Rec[] | null>(null);
  const [yearSel, setYearSel] = useState(new Date().getFullYear());

  const monthlyRef = useRef<HTMLCanvasElement>(null);
  const lokasiRef = useRef<HTMLCanvasElement>(null);
  const kategoriRef = useRef<HTMLCanvasElement>(null);
  const monthlyChart = useRef<any>(null);
  const lokasiChart = useRef<any>(null);
  const kategoriChart = useRef<any>(null);

  useEffect(() => {
    fetch("/api/kos-penyelenggaraan")
      .then((r) => r.json())
      .then(setRecords);
  }, []);

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    const set = new Set<number>([now]);
    for (const r of records || []) set.add(new Date(r.tarikh).getFullYear());
    return Array.from(set).sort((a, b) => b - a);
  }, [records]);

  const recordsThisYear = useMemo(() => (records || []).filter((r) => new Date(r.tarikh).getFullYear() === yearSel), [records, yearSel]);

  const totalKosTahunSemasa = useMemo(
    () => (records || []).filter((r) => new Date(r.tarikh).getFullYear() === new Date().getFullYear()).reduce((s, r) => s + r.kos, 0),
    [records]
  );
  const jumlahRekod = recordsThisYear.length;
  const jumlahKosTahunDipilih = useMemo(() => recordsThisYear.reduce((s, r) => s + r.kos, 0), [recordsThisYear]);

  const byMonthJenis = useMemo(() => {
    const out: Record<string, Record<string, number>> = {};
    for (const m of MONTH_ORDER) out[m] = { PEMBAIKAN: 0, PENYELENGGARAAN: 0 };
    for (const r of recordsThisYear) {
      const m = MONTH_ORDER[new Date(r.tarikh).getMonth()];
      out[m][r.jenis] = (out[m][r.jenis] ?? 0) + r.kos;
    }
    return out;
  }, [recordsThisYear]);

  const byLokasi = useMemo(() => {
    const out: Record<string, number> = {};
    for (const r of recordsThisYear) out[r.lokasi] = (out[r.lokasi] ?? 0) + r.kos;
    return out;
  }, [recordsThisYear]);

  const byKategori = useMemo(() => {
    const out: Record<string, number> = {};
    for (const r of recordsThisYear) out[r.kategori] = (out[r.kategori] ?? 0) + r.kos;
    return out;
  }, [recordsThisYear]);

  useEffect(() => {
    if (!records) return;

    if (monthlyChart.current) monthlyChart.current.destroy();
    if (lokasiChart.current) lokasiChart.current.destroy();
    if (kategoriChart.current) kategoriChart.current.destroy();

    const ctxM = monthlyRef.current?.getContext("2d");
    if (ctxM) {
      monthlyChart.current = new Chart(ctxM, {
        type: "bar",
        data: {
          labels: MONTH_ORDER,
          datasets: [
            { label: "Pembaikan", data: MONTH_ORDER.map((m) => byMonthJenis[m]?.PEMBAIKAN ?? 0), backgroundColor: "#E4212B", borderRadius: 4 },
            { label: "Penyelenggaraan", data: MONTH_ORDER.map((m) => byMonthJenis[m]?.PENYELENGGARAAN ?? 0), backgroundColor: "#1e3a5f", borderRadius: 4 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "top" }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${fmtRM(ctx.raw)}` } } },
          scales: { x: { stacked: true }, y: { stacked: true, ticks: { callback: (v: any) => "RM " + Number(v).toLocaleString("en-US") } } },
        },
      });
    }

    const lokasiKeys = Object.keys(byLokasi);
    const ctxL = lokasiRef.current?.getContext("2d");
    if (ctxL) {
      lokasiChart.current = new Chart(ctxL, {
        type: "doughnut",
        data: {
          labels: lokasiKeys.map((k) => KOS_LOKASI_LABEL[k] ?? k),
          datasets: [{ data: lokasiKeys.map((k) => byLokasi[k]), backgroundColor: lokasiKeys.map((_, i) => KATEGORI_COLORS[i % KATEGORI_COLORS.length]) }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
            tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${fmtRM(ctx.raw)}` } },
          },
        },
      });
    }

    const kategoriKeys = Object.keys(byKategori);
    const ctxK = kategoriRef.current?.getContext("2d");
    if (ctxK) {
      kategoriChart.current = new Chart(ctxK, {
        type: "doughnut",
        data: {
          labels: kategoriKeys.map((k) => KOS_KATEGORI_LABEL[k] ?? k),
          datasets: [{ data: kategoriKeys.map((k) => byKategori[k]), backgroundColor: kategoriKeys.map((_, i) => KATEGORI_COLORS[i % KATEGORI_COLORS.length]) }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
            tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${fmtRM(ctx.raw)}` } },
          },
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, yearSel]);

  if (!records) return <p className="text-sm text-[rgba(var(--ink-rgb),0.5)]">Memuatkan dashboard...</p>;

  return (
    <div>
      {canEdit && (
        <div className="mb-4 flex justify-end">
          <Link
            href="/kos-penyelenggaraan/kemaskini"
            className="bg-[#6d28d9] px-4 py-2 font-archivo text-[13px] font-extrabold text-white hover:bg-[#4c1d95]"
          >
            Kemaskini Data
          </Link>
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="border-l-4 border-[#E4212B] bg-[var(--white)] p-4 shadow-sm">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[rgba(var(--ink-rgb),0.5)]">
            Jumlah Kos Penyelenggaraan Tahun Semasa
          </div>
          <div className="mt-1.5 text-[24px] font-extrabold text-[var(--ink)]">{fmtRM(totalKosTahunSemasa)}</div>
        </div>
        <div className="border-l-4 border-[#1e3a5f] bg-[var(--white)] p-4 shadow-sm">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[rgba(var(--ink-rgb),0.5)]">
            Jumlah Rekod Penyelenggaraan ({yearSel})
          </div>
          <div className="mt-1.5 text-[24px] font-extrabold text-[var(--ink)]">{jumlahRekod.toLocaleString("en-US")}</div>
          <div className="mt-1.5 text-[12px] font-semibold text-[rgba(var(--ink-rgb),0.55)]">Jumlah kos: {fmtRM(jumlahKosTahunDipilih)}</div>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-5 border border-[rgba(var(--ink-rgb),0.2)] bg-[var(--white)] p-4">
        <div>
          <label className="mr-2 text-[13px] font-bold text-[rgba(var(--ink-rgb),0.6)]">Tahun:</label>
          <select value={yearSel} onChange={(e) => setYearSel(Number(e.target.value))} className="border border-[rgba(var(--ink-rgb),0.3)] px-3 py-1.5 text-sm font-semibold">
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-5 border border-[rgba(var(--ink-rgb),0.2)] bg-[var(--white)] p-[18px]">
        <div className="mb-0.5 font-archivo text-[15px] font-extrabold">Kos Penyelenggaraan &amp; Pembaikan Mengikut Bulanan</div>
        <div className="mb-3 text-xs text-[rgba(var(--ink-rgb),0.55)]">Jumlah kos (RM) mengikut bulan bagi tahun {yearSel}</div>
        <div className="relative h-[340px]">
          <canvas ref={monthlyRef} />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="border border-[rgba(var(--ink-rgb),0.2)] bg-[var(--white)] p-[18px]">
          <div className="mb-0.5 font-archivo text-[15px] font-extrabold">Kos Mengikut Lokasi ({yearSel})</div>
          <div className="mb-3 text-xs text-[rgba(var(--ink-rgb),0.55)]">Agregat kos mengikut lokasi bagi tahun {yearSel}</div>
          <div className="relative h-[300px]">
            <canvas ref={lokasiRef} />
          </div>
        </div>
        <div className="border border-[rgba(var(--ink-rgb),0.2)] bg-[var(--white)] p-[18px]">
          <div className="mb-0.5 font-archivo text-[15px] font-extrabold">Kos Mengikut Kategori ({yearSel})</div>
          <div className="mb-3 text-xs text-[rgba(var(--ink-rgb),0.55)]">Agregat kos mengikut kategori kerja bagi tahun {yearSel}</div>
          <div className="relative h-[300px]">
            <canvas ref={kategoriRef} />
          </div>
        </div>
      </div>

      <div className="border border-[rgba(var(--ink-rgb),0.2)] bg-[var(--white)] p-[18px]">
        <div className="mb-0.5 font-archivo text-[15px] font-extrabold">Rekod Kos Penyelenggaraan ({yearSel})</div>
        <div className="mb-3 text-xs text-[rgba(var(--ink-rgb),0.55)]">Senarai penuh rekod bagi tahun dipilih</div>
        <div className="max-h-[380px] overflow-auto border border-[var(--surface)]">
          <table className="w-full min-w-[820px] border-collapse text-[13px]">
            <thead>
              <tr className="sticky top-0 bg-[#1a1a1a] text-white">
                <th className="px-3 py-2 text-left font-semibold">Tarikh</th>
                <th className="px-3 py-2 text-left font-semibold">Lokasi</th>
                <th className="px-3 py-2 text-left font-semibold">Kategori</th>
                <th className="px-3 py-2 text-left font-semibold">Jenis</th>
                <th className="px-3 py-2 text-right font-semibold">Kos (RM)</th>
              </tr>
            </thead>
            <tbody>
              {[...recordsThisYear]
                .sort((a, b) => new Date(b.tarikh).getTime() - new Date(a.tarikh).getTime())
                .map((r) => (
                  <tr key={r.id} className="odd:bg-[var(--white)] even:bg-[var(--surface)]">
                    <td className="border-b border-[var(--surface)] px-3 py-2">{new Date(r.tarikh).toLocaleDateString("ms-MY")}</td>
                    <td className="border-b border-[var(--surface)] px-3 py-2 font-bold">{KOS_LOKASI_LABEL[r.lokasi] ?? r.lokasi}</td>
                    <td className="border-b border-[var(--surface)] px-3 py-2">{KOS_KATEGORI_LABEL[r.kategori] ?? r.kategori}</td>
                    <td className="border-b border-[var(--surface)] px-3 py-2">{KOS_JENIS_LABEL[r.jenis] ?? r.jenis}</td>
                    <td className="border-b border-[var(--surface)] px-3 py-2 text-right">{r.kos.toLocaleString("en-US")}</td>
                  </tr>
                ))}
              {recordsThisYear.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-[rgba(var(--ink-rgb),0.5)]">
                    Tiada data untuk tahun {yearSel} lagi &mdash; gunakan &quot;Kemaskini Data&quot; untuk tambah rekod
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
