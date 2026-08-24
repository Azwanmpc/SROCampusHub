"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Chart, registerables } from "chart.js";
import { getChartColors } from "@/lib/chartTheme";

Chart.register(...registerables);

type RawRec = { id: string; tarikh: string; organisasi: string; lokasi: string; bilanganPeserta: number; hasilTerimaan: number };
type Agg = { hasil: number; peserta: number; bilangan: number };

const MONTH_ORDER = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];
const JENIS_COLORS: Record<string, string> = {
  ICC: "#0d9488",
  "DEWAN PRODUKTIVITI": "#f59e0b",
  ASRAMA: "#7c3aed",
  "DEWAN MAKAN": "#16a34a",
  TQM: "#2563eb",
  MADANI: "#db2777",
};
const COLOR_PREV = "#1e3a5f";
const COLOR_CURR = "#E4212B";

function fmtRM(n: number) {
  return "RM " + Math.round(n).toLocaleString("en-US");
}
function fmtNum(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

export default function HasilSewaanDashboard({ canEdit }: { canEdit: boolean }) {
  const [records, setRecords] = useState<RawRec[] | null>(null);
  const [monthSel, setMonthSel] = useState("ALL");
  const [jenisSel, setJenisSel] = useState("ALL");
  const [yearSel, setYearSel] = useState(new Date().getFullYear());

  const barRef = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);
  const barChart = useRef<any>(null);
  const donutChart = useRef<any>(null);
  const [themeTick, setThemeTick] = useState(0);

  useEffect(() => {
    fetch("/api/hasil-sewaan")
      .then((r) => r.json())
      .then(setRecords);
  }, []);

  useEffect(() => {
    const onThemeChange = () => setThemeTick((t) => t + 1);
    window.addEventListener("sro-theme-change", onThemeChange);
    return () => window.removeEventListener("sro-theme-change", onThemeChange);
  }, []);

  const years = useMemo<Record<string, Record<string, Record<string, Agg>>>>(() => {
    const byYear: Record<string, Record<string, Record<string, Agg>>> = {};
    for (const r of records || []) {
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

  const yearOptions = useMemo(() => {
    const set = new Set<number>([new Date().getFullYear()]);
    for (const y of Object.keys(years)) set.add(Number(y));
    return Array.from(set).sort((a, b) => a - b);
  }, [years]);

  const currYear = String(yearSel);
  const prevYear = String(yearSel - 1);

  const monthsIn = (year: string) => Object.keys(years[year] || {});
  const allMonths = useMemo(() => MONTH_ORDER.filter((m) => monthsIn(prevYear).includes(m) || monthsIn(currYear).includes(m)), [years, prevYear, currYear]);
  const commonMonths = useMemo(() => MONTH_ORDER.filter((m) => monthsIn(prevYear).includes(m) && monthsIn(currYear).includes(m)), [years, prevYear, currYear]);

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

  // Box 1 & 2 are always whole-year snapshots (prevYear = complete/closed year,
  // currYear = running total so far) — independent of the Bulan filter, which
  // only affects the charts/tables below.
  const totalHasilPrevFullYear = sumOverMonths(prevYear, MONTH_ORDER, jenisSel, "hasil");
  const totalHasilCurrFullYear = sumOverMonths(currYear, MONTH_ORDER, jenisSel, "hasil");
  const pctHasilVsKeseluruhanPrev = totalHasilPrevFullYear ? (totalHasilCurrFullYear / totalHasilPrevFullYear) * 100 : 0;

  const totalPesertaPrev = sumOverMonths(prevYear, monthsForCompare, jenisSel, "peserta");
  const totalPesertaCurr = sumOverMonths(currYear, monthsForCompare, jenisSel, "peserta");
  const totalBilPrev = sumOverMonths(prevYear, monthsForCompare, jenisSel, "bilangan");
  const totalBilCurr = sumOverMonths(currYear, monthsForCompare, jenisSel, "bilangan");

  const deltaPeserta = totalPesertaPrev ? ((totalPesertaCurr - totalPesertaPrev) / totalPesertaPrev) * 100 : 0;
  const deltaBil = totalBilPrev ? ((totalBilCurr - totalBilPrev) / totalBilPrev) * 100 : 0;

  const jenisForChart = jenisSel === "ALL" ? jenisList : [jenisSel];

  useEffect(() => {
    if (!records) return;

    if (barChart.current) barChart.current.destroy();
    if (donutChart.current) donutChart.current.destroy();

    const { text: chartText, grid: chartGrid } = getChartColors();

    const ctxH = barRef.current?.getContext("2d");
    if (ctxH) {
      barChart.current = new Chart(ctxH, {
        type: "bar",
        data: {
          labels: monthsFull,
          datasets: [
            { label: prevYear, data: monthsFull.map((m) => getVal(prevYear, m, jenisSel, "hasil")), backgroundColor: COLOR_PREV, borderRadius: 6 },
            { label: currYear, data: monthsFull.map((m) => getVal(currYear, m, jenisSel, "hasil")), backgroundColor: COLOR_CURR, borderRadius: 6 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "top", labels: { color: chartText } },
            tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${fmtRM(ctx.raw)}` } },
          },
          scales: {
            x: { ticks: { color: chartText }, grid: { color: chartGrid } },
            y: { ticks: { color: chartText, callback: (v: any) => "RM " + Number(v).toLocaleString("en-US") }, grid: { color: chartGrid } },
          },
        },
      });
    }

    const ctxJ = donutRef.current?.getContext("2d");
    if (ctxJ) {
      donutChart.current = new Chart(ctxJ, {
        type: "doughnut",
        data: {
          labels: jenisForChart,
          datasets: [
            {
              data: jenisForChart.map((j) => sumOverMonths(currYear, monthsForCompare, j, "hasil")),
              backgroundColor: jenisForChart.map((j) => JENIS_COLORS[j] || "#94a3b8"),
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: "bottom", labels: { color: chartText, boxWidth: 12, font: { size: 11 } } },
            tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${fmtRM(ctx.raw)}` } },
          },
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, monthSel, jenisSel, yearSel, themeTick]);

  const rows = useMemo(() => {
    const out: { m: string; j: string; hPrev: number; hCurr: number; pPrev: number; pCurr: number; bPrev: number; bCurr: number }[] = [];
    for (const m of monthsFull) {
      for (const j of jenisForChart) {
        const hPrev = getVal(prevYear, m, j, "hasil");
        const hCurr = getVal(currYear, m, j, "hasil");
        const pPrev = getVal(prevYear, m, j, "peserta");
        const pCurr = getVal(currYear, m, j, "peserta");
        const bPrev = getVal(prevYear, m, j, "bilangan");
        const bCurr = getVal(currYear, m, j, "bilangan");
        if (hPrev === 0 && hCurr === 0 && pPrev === 0 && pCurr === 0) continue;
        out.push({ m, j, hPrev, hCurr, pPrev, pCurr, bPrev, bCurr });
      }
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, monthSel, jenisSel, yearSel]);

  if (!records) return <p className="text-sm text-[rgba(var(--ink-rgb),0.5)]">Memuatkan dashboard...</p>;

  return (
    <div>
      {canEdit && (
        <div className="mb-4 flex justify-end">
          <Link
            href="/hasil-sewaan/kemaskini"
            className="bg-[var(--accent)] px-4 py-2 font-archivo text-[13px] font-extrabold text-white hover:bg-[var(--accent-dark)]"
          >
            Kemaskini Data
          </Link>
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-l-4 border-[#E4212B] bg-[var(--white)] p-4 shadow-sm">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[rgba(var(--ink-rgb),0.5)]">
            Prestasi Keseluruhan Hasil Sewaan Fasiliti {prevYear}
          </div>
          <div className="mt-1.5 text-[24px] font-extrabold text-[var(--ink)]">{fmtRM(totalHasilPrevFullYear)}</div>
        </div>
        <div className="border-l-4 border-[#1e3a5f] bg-[var(--white)] p-4 shadow-sm">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[rgba(var(--ink-rgb),0.5)]">
            Hasil Sewaan Fasiliti Terkini {currYear}
          </div>
          <div className="mt-1.5 text-[24px] font-extrabold text-[var(--ink)]">{fmtRM(totalHasilCurrFullYear)}</div>
          <div className="mt-1.5 inline-block rounded-full bg-[var(--success-bg)] px-2.5 py-0.5 text-[12px] font-bold text-[var(--success)]">
            ✓ Telah mencapai {pctHasilVsKeseluruhanPrev.toFixed(1)}% vs keseluruhan {prevYear}
          </div>
        </div>
        <div className="border-l-4 border-[#0d9488] bg-[var(--white)] p-4 shadow-sm">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[rgba(var(--ink-rgb),0.5)]">Jumlah Peserta {currYear}</div>
          <div className="mt-1.5 text-[24px] font-extrabold text-[var(--ink)]">{fmtNum(totalPesertaCurr)}</div>
          <div className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[12px] font-bold ${deltaPeserta >= 0 ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--danger-bg)] text-[var(--danger)]"}`}>
            {deltaPeserta >= 0 ? "▲" : "▼"} {Math.abs(deltaPeserta).toFixed(1)}% vs {prevYear}
          </div>
        </div>
        <div className="border-l-4 border-[#f59e0b] bg-[var(--white)] p-4 shadow-sm">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[rgba(var(--ink-rgb),0.5)]">Bilangan Tempahan {currYear}</div>
          <div className="mt-1.5 text-[24px] font-extrabold text-[var(--ink)]">{fmtNum(totalBilCurr)}</div>
          <div className={`mt-1.5 inline-block rounded-full px-2.5 py-0.5 text-[12px] font-bold ${deltaBil >= 0 ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--danger-bg)] text-[var(--danger)]"}`}>
            {deltaBil >= 0 ? "▲" : "▼"} {Math.abs(deltaBil).toFixed(1)}% vs {prevYear}
          </div>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-5 border border-[rgba(var(--ink-rgb),0.2)] bg-[var(--white)] p-4">
        <div>
          <label className="mr-2 text-[13px] font-bold text-[rgba(var(--ink-rgb),0.6)]">Tahun:</label>
          <select value={yearSel} onChange={(e) => setYearSel(Number(e.target.value))} className="border border-[rgba(var(--ink-rgb),0.3)] bg-[var(--white)] px-3 py-1.5 text-sm font-semibold">
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 text-[13px] font-bold text-[rgba(var(--ink-rgb),0.6)]">Bulan:</label>
          <select value={monthSel} onChange={(e) => setMonthSel(e.target.value)} className="border border-[rgba(var(--ink-rgb),0.3)] bg-[var(--white)] px-3 py-1.5 text-sm font-semibold">
            <option value="ALL">Semua Bulan</option>
            {allMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 text-[13px] font-bold text-[rgba(var(--ink-rgb),0.6)]">Jenis Sewaan / Kemudahan:</label>
          <select value={jenisSel} onChange={(e) => setJenisSel(e.target.value)} className="border border-[rgba(var(--ink-rgb),0.3)] bg-[var(--white)] px-3 py-1.5 text-sm font-semibold">
            <option value="ALL">Semua Jenis Sewaan</option>
            {jenisList.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-5 border border-[rgba(var(--ink-rgb),0.2)] bg-[var(--white)] p-[18px]">
        <div className="mb-0.5 font-archivo text-[15px] font-extrabold">Perbandingan Hasil Sewaan Bulanan (RM)</div>
        <div className="mb-3 text-xs text-[rgba(var(--ink-rgb),0.55)]">
          Jumlah hasil sewaan kemudahan mengikut bulan, {prevYear} vs {currYear}
        </div>
        <div className="relative h-[340px]">
          <canvas ref={barRef} />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="border border-[rgba(var(--ink-rgb),0.2)] bg-[var(--white)] p-[18px]">
          <div className="mb-0.5 font-archivo text-[15px] font-extrabold">Hasil Mengikut Jenis Sewaan ({currYear})</div>
          <div className="mb-3 text-xs text-[rgba(var(--ink-rgb),0.55)]">Agregat tempoh dipilih &mdash; tahun {currYear} sahaja</div>
          <div className="relative h-[300px]">
            <canvas ref={donutRef} />
          </div>
        </div>
        <div className="border border-[rgba(var(--ink-rgb),0.2)] bg-[var(--white)] p-[18px]">
          <div className="mb-0.5 font-archivo text-[15px] font-extrabold">Kekerapan Tempahan Mengikut Jenis</div>
          <div className="mb-3 text-xs text-[rgba(var(--ink-rgb),0.55)]">
            Bilangan kekerapan tempahan bagi tahun {prevYear} &amp; {currYear}
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-[#1a1a1a] text-white">
                  <th className="px-3 py-2 text-left font-semibold">Jenis Sewaan</th>
                  <th className="px-3 py-2 text-left font-semibold">{prevYear}</th>
                  <th className="px-3 py-2 text-left font-semibold">{currYear}</th>
                  <th className="px-3 py-2 text-left font-semibold">Perubahan</th>
                </tr>
              </thead>
              <tbody>
                {jenisForChart.map((j) => {
                  const kPrev = sumOverMonths(prevYear, monthsForCompare, j, "bilangan");
                  const kCurr = sumOverMonths(currYear, monthsForCompare, j, "bilangan");
                  const diff = kCurr - kPrev;
                  return (
                    <tr key={j} className="odd:bg-[var(--white)] even:bg-[var(--surface)]">
                      <td className="border-b border-[var(--surface)] px-3 py-2">
                        <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white" style={{ background: JENIS_COLORS[j] || "#94a3b8" }}>
                          {j}
                        </span>
                      </td>
                      <td className="border-b border-[var(--surface)] px-3 py-2">{fmtNum(kPrev)}</td>
                      <td className="border-b border-[var(--surface)] px-3 py-2">{fmtNum(kCurr)}</td>
                      <td className="border-b border-[var(--surface)] px-3 py-2">
                        <span className={`rounded-full px-2 py-0.5 text-[12px] font-bold ${diff >= 0 ? "bg-[var(--success-bg)] text-[var(--success)]" : "bg-[var(--danger-bg)] text-[var(--danger)]"}`}>
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

      <div className="border border-[rgba(var(--ink-rgb),0.2)] bg-[var(--white)] p-[18px]">
        <div className="mb-0.5 font-archivo text-[15px] font-extrabold">Butiran Terperinci Mengikut Bulan &amp; Jenis Sewaan</div>
        <div className="mb-3 text-xs text-[rgba(var(--ink-rgb),0.55)]">Gunakan penapis di atas untuk tumpuan data</div>
        <div className="max-h-[380px] overflow-auto border border-[var(--surface)]">
          <table className="w-full min-w-[720px] border-collapse text-[13px]">
            <thead>
              <tr className="sticky top-0 bg-[#1a1a1a] text-white">
                <th className="px-3 py-2 text-left font-semibold">Bulan</th>
                <th className="px-3 py-2 text-left font-semibold">Jenis Sewaan</th>
                <th className="px-3 py-2 text-left font-semibold">Hasil {prevYear} (RM)</th>
                <th className="px-3 py-2 text-left font-semibold">Hasil {currYear} (RM)</th>
                <th className="px-3 py-2 text-left font-semibold">Peserta {prevYear}</th>
                <th className="px-3 py-2 text-left font-semibold">Peserta {currYear}</th>
                <th className="px-3 py-2 text-left font-semibold">Bilangan {prevYear}</th>
                <th className="px-3 py-2 text-left font-semibold">Bilangan {currYear}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="odd:bg-[var(--white)] even:bg-[var(--surface)]">
                  <td className="border-b border-[var(--surface)] px-3 py-2">{r.m}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2">
                    <span className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white" style={{ background: JENIS_COLORS[r.j] || "#94a3b8" }}>
                      {r.j}
                    </span>
                  </td>
                  <td className="border-b border-[var(--surface)] px-3 py-2">{fmtRM(r.hPrev)}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2">{fmtRM(r.hCurr)}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2">{fmtNum(r.pPrev)}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2">{fmtNum(r.pCurr)}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2">{fmtNum(r.bPrev)}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2">{fmtNum(r.bCurr)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center text-sm text-[rgba(var(--ink-rgb),0.5)]">
                    Tiada data untuk tahun {currYear} lagi &mdash; gunakan &quot;Kemaskini Data&quot; untuk tambah rekod
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
