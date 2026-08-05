"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Script from "next/script";

type RawRec = { id: string; tarikh: string; organisasi: string; lokasi: string; bilanganPeserta: number; hasilTerimaan: number };
type Agg = { hasil: number; peserta: number; bilangan: number };

declare global {
  interface Window {
    Chart: any;
  }
}

const MONTH_ORDER = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
const JENIS_COLORS: Record<string, string> = {
  ICC: "#0d9488",
  "DEWAN PRODUKTIVITI": "#f59e0b",
  ASRAMA: "#7c3aed",
  "DEWAN MAKAN": "#16a34a",
  TQM: "#2563eb",
  MADANI: "#db2777",
};
const COLOR_2025 = "#1e3a5f";
const COLOR_2026 = "#E4212B";

function fmtRM(n: number) {
  return "RM " + Math.round(n).toLocaleString("en-US");
}
function fmtNum(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

export default function HasilSewaanDashboard() {
  const [records, setRecords] = useState<RawRec[] | null>(null);
  const [chartReady, setChartReady] = useState(false);
  const [monthSel, setMonthSel] = useState("ALL");
  const [jenisSel, setJenisSel] = useState("ALL");

  const barRef = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);
  const barChart = useRef<any>(null);
  const donutChart = useRef<any>(null);

  useEffect(() => {
    fetch("/api/hasil-sewaan")
      .then((r) => r.json())
      .then(setRecords);
  }, []);

  const years = useMemo<Record<string, Record<string, Record<string, Agg>>>>(() => {
    if (!records) return { "2025": {}, "2026": {} };
    const byYear: Record<string, Record<string, Record<string, Agg>>> = {};
    for (const r of records) {
      const d = new Date(r.tarikh);
      const year = String(d.getFullYear());
      const month = MONTH_ORDER[d.getMonth()];
      const jenis = r.lokasi;
      byYear[year] = byYear[year] || {};
      byYear[year][month] = byYear[year][month] || {};
      const cell = byYear[year][month][jenis] || { hasil: 0, peserta: 0, bilangan: 0 };
      cell.hasil += r.hasilTerimaan;
      cell.peserta += r.bilanganPeserta;
      cell.bilangan += 1;
      byYear[year][month][jenis] = cell;
    }
    return byYear;
  }, [records]);

  const monthsIn = (year: string) => Object.keys(years[year] || {});
  const allMonths = useMemo(() => MONTH_ORDER.filter((m) => monthsIn("2025").includes(m) || monthsIn("2026").includes(m)), [years]);
  const commonMonths = useMemo(() => MONTH_ORDER.filter((m) => monthsIn("2025").includes(m) && monthsIn("2026").includes(m)), [years]);

  const jenisList = useMemo(() => {
    const set = new Set<string>();
    for (const r of records || []) set.add(r.lokasi);
    return Array.from(set);
  }, [records]);

  function getVal(year: string, month: string, jenis: string, field: "hasil" | "peserta" | "bilangan") {
    const mo = years[year]?.[month];
    if (!mo) return 0;
    if (jenis === "ALL") {
      return Object.values(mo).reduce((sum, r) => sum + r[field], 0);
    }
    return mo[jenis]?.[field] ?? 0;
  }

  function sumOverMonths(year: string, months: string[], jenis: string, field: "hasil" | "peserta" | "bilangan") {
    return months.reduce((s, m) => s + getVal(year, m, jenis, field), 0);
  }

  const monthsForCompare = monthSel === "ALL" ? commonMonths : [monthSel];
  const monthsFull = monthSel === "ALL" ? allMonths : [monthSel];

  const totalHasil25 = sumOverMonths("2025", monthsForCompare, jenisSel, "hasil");
  const totalHasil26 = sumOverMonths("2026", monthsForCompare, jenisSel, "hasil");
  const totalPeserta25 = sumOverMonths("2025", monthsForCompare, jenisSel, "peserta");
  const totalPeserta26 = sumOverMonths("2026", monthsForCompare, jenisSel, "peserta");
  const totalBil25 = sumOverMonths("2025", monthsForCompare, jenisSel, "bilangan");
  const totalBil26 = sumOverMonths("2026", monthsForCompare, jenisSel, "bilangan");

  const deltaHasil = totalHasil25 ? ((totalHasil26 - totalHasil25) / totalHasil25) * 100 : 0;
  const deltaPeserta = totalPeserta25 ? ((totalPeserta26 - totalPeserta25) / totalPeserta25) * 100 : 0;
  const deltaBil = totalBil25 ? ((totalBil26 - totalBil25) / totalBil25) * 100 : 0;

  const jenisForChart = jenisSel === "ALL" ? jenisList : [jenisSel];

  useEffect(() => {
    if (!chartReady || !records || !window.Chart) return;

    if (barChart.current) barChart.current.destroy();
    if (donutChart.current) donutChart.current.destroy();

    const ctxH = barRef.current?.getContext("2d");
    if (ctxH) {
      barChart.current = new window.Chart(ctxH, {
        type: "bar",
        data: {
          labels: monthsFull,
          datasets: [
            { label: "2025", data: monthsFull.map((m) => getVal("2025", m, jenisSel, "hasil")), backgroundColor: COLOR_2025, borderRadius: 6 },
            { label: "2026", data: monthsFull.map((m) => getVal("2026", m, jenisSel, "hasil")), backgroundColor: COLOR_2026, borderRadius: 6 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "top" }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${fmtRM(ctx.raw)}` } } },
          scales: { y: { ticks: { callback: (v: any) => "RM " + Number(v).toLocaleString("en-US") } } },
        },
      });
    }

    const ctxJ = donutRef.current?.getContext("2d");
    if (ctxJ) {
      donutChart.current = new window.Chart(ctxJ, {
        type: "doughnut",
        data: {
          labels: jenisForChart,
          datasets: [
            {
              data: jenisForChart.map((j) => sumOverMonths("2026", monthsForCompare, j, "hasil")),
              backgroundColor: jenisForChart.map((j) => JENIS_COLORS[j] || "#94a3b8"),
            },
          ],
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
  }, [chartReady, records, monthSel, jenisSel]);

  const rows = useMemo(() => {
    const out: { m: string; j: string; h25: number; h26: number; p25: number; p26: number; b25: number; b26: number }[] = [];
    for (const m of monthsFull) {
      for (const j of jenisForChart) {
        const h25 = getVal("2025", m, j, "hasil");
        const h26 = getVal("2026", m, j, "hasil");
        const p25 = getVal("2025", m, j, "peserta");
        const p26 = getVal("2026", m, j, "peserta");
        const b25 = getVal("2025", m, j, "bilangan");
        const b26 = getVal("2026", m, j, "bilangan");
        if (h25 === 0 && h26 === 0 && p25 === 0 && p26 === 0) continue;
        out.push({ m, j, h25, h26, p25, p26, b25, b26 });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, monthSel, jenisSel]);

  if (!records) return <p className="text-sm text-[rgba(32,30,29,0.5)]">Memuatkan dashboard...</p>;

  return (
    <div>
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js" strategy="afterInteractive" onLoad={() => setChartReady(true)} />

      <div className="mb-4 flex justify-end">
        <Link
          href="/hasil-sewaan/kemaskini"
          className="bg-[#6d28d9] px-4 py-2 font-archivo text-[13px] font-extrabold text-white hover:bg-[#4c1d95]"
        >
          Kemaskini Data
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-l-4 border-[#E4212B] bg-white p-4 shadow-sm">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[rgba(32,30,29,0.5)]">Hasil Sewaan 2025</div>
          <div className="mt-1.5 text-[24px] font-extrabold text-[#1a1a1a]">{fmtRM(totalHasil25)}</div>
        </div>
        <div className="border-l-4 border-[#1e3a5f] bg-white p-4 shadow-sm">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[rgba(32,30,29,0.5)]">Hasil Sewaan 2026</div>
          <div className="mt-1.5 text-[24px] font-extrabold text-[#1a1a1a]">{fmtRM(totalHasil26)}</div>
          <div className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[12px] font-bold ${deltaHasil >= 0 ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fee2e2] text-[#b91c1c]"}`}>
            {deltaHasil >= 0 ? "▲" : "▼"} {Math.abs(deltaHasil).toFixed(1)}% vs 2025
          </div>
        </div>
        <div className="border-l-4 border-[#0d9488] bg-white p-4 shadow-sm">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[rgba(32,30,29,0.5)]">Jumlah Peserta 2026</div>
          <div className="mt-1.5 text-[24px] font-extrabold text-[#1a1a1a]">{fmtNum(totalPeserta26)}</div>
          <div className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[12px] font-bold ${deltaPeserta >= 0 ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fee2e2] text-[#b91c1c]"}`}>
            {deltaPeserta >= 0 ? "▲" : "▼"} {Math.abs(deltaPeserta).toFixed(1)}% vs 2025
          </div>
        </div>
        <div className="border-l-4 border-[#f59e0b] bg-white p-4 shadow-sm">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[rgba(32,30,29,0.5)]">Bilangan Tempahan 2026</div>
          <div className="mt-1.5 text-[24px] font-extrabold text-[#1a1a1a]">{fmtNum(totalBil26)}</div>
          <div className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[12px] font-bold ${deltaBil >= 0 ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fee2e2] text-[#b91c1c]"}`}>
            {deltaBil >= 0 ? "▲" : "▼"} {Math.abs(deltaBil).toFixed(1)}% vs 2025
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-5 border border-[rgba(32,30,29,0.2)] bg-white p-4">
        <div>
          <label className="mr-2 text-[13px] font-bold text-[rgba(32,30,29,0.6)]">Bulan:</label>
          <select value={monthSel} onChange={(e) => setMonthSel(e.target.value)} className="border border-[rgba(32,30,29,0.3)] px-3 py-1.5 text-sm font-semibold">
            <option value="ALL">Semua Bulan</option>
            {allMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 text-[13px] font-bold text-[rgba(32,30,29,0.6)]">Jenis Sewaan / Kemudahan:</label>
          <select value={jenisSel} onChange={(e) => setJenisSel(e.target.value)} className="border border-[rgba(32,30,29,0.3)] px-3 py-1.5 text-sm font-semibold">
            <option value="ALL">Semua Jenis Sewaan</option>
            {jenisList.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-5 border border-[rgba(32,30,29,0.2)] bg-white p-[18px]">
        <div className="mb-0.5 font-archivo text-[15px] font-extrabold">Perbandingan Hasil Sewaan Bulanan (RM)</div>
        <div className="mb-3 text-xs text-[rgba(32,30,29,0.55)]">Jumlah hasil sewaan kemudahan mengikut bulan, 2025 vs 2026</div>
        <div className="relative h-[340px]">
          <canvas ref={barRef} />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="border border-[rgba(32,30,29,0.2)] bg-white p-[18px]">
          <div className="mb-0.5 font-archivo text-[15px] font-extrabold">Hasil Mengikut Jenis Sewaan (2026)</div>
          <div className="mb-3 text-xs text-[rgba(32,30,29,0.55)]">Agregat tempoh dipilih &mdash; tahun 2026 sahaja</div>
          <div className="relative h-[300px]">
            <canvas ref={donutRef} />
          </div>
        </div>
        <div className="border border-[rgba(32,30,29,0.2)] bg-white p-[18px]">
          <div className="mb-0.5 font-archivo text-[15px] font-extrabold">Kekerapan Tempahan Mengikut Jenis</div>
          <div className="mb-3 text-xs text-[rgba(32,30,29,0.55)]">Bilangan kekerapan tempahan bagi tahun 2025 &amp; 2026</div>
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#1a1a1a] text-white">
                  <th className="px-3 py-2 text-left font-semibold">Jenis Sewaan</th>
                  <th className="px-3 py-2 text-left font-semibold">2025</th>
                  <th className="px-3 py-2 text-left font-semibold">2026</th>
                  <th className="px-3 py-2 text-left font-semibold">Perubahan</th>
                </tr>
              </thead>
              <tbody>
                {jenisForChart.map((j) => {
                  const k25 = sumOverMonths("2025", monthsForCompare, j, "bilangan");
                  const k26 = sumOverMonths("2026", monthsForCompare, j, "bilangan");
                  const diff = k26 - k25;
                  return (
                    <tr key={j} className="odd:bg-white even:bg-[#fafbfd]">
                      <td className="border-b border-[#eef0f4] px-3 py-2">
                        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white" style={{ background: JENIS_COLORS[j] || "#94a3b8" }}>
                          {j}
                        </span>
                      </td>
                      <td className="border-b border-[#eef0f4] px-3 py-2">{fmtNum(k25)}</td>
                      <td className="border-b border-[#eef0f4] px-3 py-2">{fmtNum(k26)}</td>
                      <td className="border-b border-[#eef0f4] px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-[12px] font-bold ${diff >= 0 ? "bg-[#dcfce7] text-[#15803d]" : "bg-[#fee2e2] text-[#b91c1c]"}`}>
                          {diff >= 0 ? "+" : ""}
                          {fmtNum(diff)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="border border-[rgba(32,30,29,0.2)] bg-white p-[18px]">
        <div className="mb-0.5 font-archivo text-[15px] font-extrabold">Butiran Terperinci Mengikut Bulan &amp; Jenis Sewaan</div>
        <div className="mb-3 text-xs text-[rgba(32,30,29,0.55)]">Gunakan penapis di atas untuk tumpuan data</div>
        <div className="max-h-[380px] overflow-auto border border-[#eef0f4]">
          <table className="w-full min-w-[720px] border-collapse text-[13px]">
            <thead>
              <tr className="sticky top-0 bg-[#1a1a1a] text-white">
                <th className="px-3 py-2 text-left font-semibold">Bulan</th>
                <th className="px-3 py-2 text-left font-semibold">Jenis Sewaan</th>
                <th className="px-3 py-2 text-left font-semibold">Hasil 2025 (RM)</th>
                <th className="px-3 py-2 text-left font-semibold">Hasil 2026 (RM)</th>
                <th className="px-3 py-2 text-left font-semibold">Peserta 2025</th>
                <th className="px-3 py-2 text-left font-semibold">Peserta 2026</th>
                <th className="px-3 py-2 text-left font-semibold">Bilangan 2025</th>
                <th className="px-3 py-2 text-left font-semibold">Bilangan 2026</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-[#fafbfd]">
                  <td className="border-b border-[#eef0f4] px-3 py-2">{r.m}</td>
                  <td className="border-b border-[#eef0f4] px-3 py-2">
                    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white" style={{ background: JENIS_COLORS[r.j] || "#94a3b8" }}>
                      {r.j}
                    </span>
                  </td>
                  <td className="border-b border-[#eef0f4] px-3 py-2">{fmtRM(r.h25)}</td>
                  <td className="border-b border-[#eef0f4] px-3 py-2">{fmtRM(r.h26)}</td>
                  <td className="border-b border-[#eef0f4] px-3 py-2">{fmtNum(r.p25)}</td>
                  <td className="border-b border-[#eef0f4] px-3 py-2">{fmtNum(r.p26)}</td>
                  <td className="border-b border-[#eef0f4] px-3 py-2">{fmtNum(r.b25)}</td>
                  <td className="border-b border-[#eef0f4] px-3 py-2">{fmtNum(r.b26)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
