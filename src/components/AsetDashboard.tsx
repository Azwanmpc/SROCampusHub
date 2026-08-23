"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Chart, registerables } from "chart.js";
import { WarningCircle } from "@phosphor-icons/react";
import KewPa7Modal from "@/components/KewPa7Modal";
import KewPa14Modal from "@/components/KewPa14Modal";
import { getChartColors } from "@/lib/chartTheme";

Chart.register(...registerables);

type Aset = { id: string; namaAset: string; noPendaftaran: string; tahun: string | null; lokasi: string; status: string };

const STATUS_COLORS: Record<string, string> = { BAIK: "#16a34a", ROSAK: "#E4212B" };

function fmtNum(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

export default function AsetDashboard({ canEdit }: { canEdit: boolean }) {
  const [records, setRecords] = useState<Aset[] | null>(null);
  const [lokasiSel, setLokasiSel] = useState("ALL");
  const [statusSel, setStatusSel] = useState("ALL");
  const [showKewPa7, setShowKewPa7] = useState(false);
  const [showKewPa14, setShowKewPa14] = useState(false);

  const barRef = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);
  const barChart = useRef<any>(null);
  const donutChart = useRef<any>(null);
  const [themeTick, setThemeTick] = useState(0);

  function load() {
    fetch("/api/aset")
      .then((r) => r.json())
      .then(setRecords);
  }

  useEffect(load, []);

  useEffect(() => {
    const onThemeChange = () => setThemeTick((t) => t + 1);
    window.addEventListener("sro-theme-change", onThemeChange);
    return () => window.removeEventListener("sro-theme-change", onThemeChange);
  }, []);

  const lokasiList = useMemo(() => {
    const set = new Set<string>();
    for (const r of records || []) set.add(r.lokasi);
    return Array.from(set).sort();
  }, [records]);

  const byLokasi = useMemo(() => {
    const map = new Map<string, { jumlah: number; baik: number; rosak: number }>();
    for (const r of records || []) {
      const cell = map.get(r.lokasi) || { jumlah: 0, baik: 0, rosak: 0 };
      cell.jumlah += 1;
      if (r.status === "ROSAK") cell.rosak += 1;
      else cell.baik += 1;
      map.set(r.lokasi, cell);
    }
    return map;
  }, [records]);

  const filtered = useMemo(() => {
    return (records || []).filter((r) => (lokasiSel === "ALL" || r.lokasi === lokasiSel) && (statusSel === "ALL" || r.status === statusSel));
  }, [records, lokasiSel, statusSel]);

  const jumlahAset = records?.length ?? 0;
  const jumlahBaik = (records || []).filter((r) => r.status === "BAIK").length;
  const jumlahRosak = (records || []).filter((r) => r.status === "ROSAK").length;
  const jumlahLokasi = lokasiList.length;

  useEffect(() => {
    if (!records) return;

    if (barChart.current) barChart.current.destroy();
    if (donutChart.current) donutChart.current.destroy();

    const { text: chartText, grid: chartGrid } = getChartColors();

    const topLokasi = Array.from(byLokasi.entries())
      .sort((a, b) => b[1].jumlah - a[1].jumlah)
      .slice(0, 10);

    const ctxH = barRef.current?.getContext("2d");
    if (ctxH) {
      barChart.current = new Chart(ctxH, {
        type: "bar",
        data: {
          labels: topLokasi.map(([lokasi]) => lokasi),
          datasets: [
            { label: "Baik", data: topLokasi.map(([, v]) => v.baik), backgroundColor: "#16a34a", borderRadius: 4 },
            { label: "Rosak", data: topLokasi.map(([, v]) => v.rosak), backgroundColor: "#E4212B", borderRadius: 4 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "top", labels: { color: chartText } } },
          scales: {
            x: { stacked: true, ticks: { color: chartText }, grid: { color: chartGrid } },
            y: { stacked: true, ticks: { color: chartText, precision: 0 }, grid: { color: chartGrid } },
          },
        },
      });
    }

    const ctxJ = donutRef.current?.getContext("2d");
    if (ctxJ) {
      donutChart.current = new Chart(ctxJ, {
        type: "doughnut",
        data: {
          labels: ["Baik", "Rosak"],
          datasets: [{ data: [jumlahBaik, jumlahRosak], backgroundColor: [STATUS_COLORS.BAIK, STATUS_COLORS.ROSAK] }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "bottom", labels: { color: chartText } } },
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records, themeTick]);

  if (!records) return <p className="text-sm text-[rgba(var(--ink-rgb),0.5)]">Memuatkan dashboard...</p>;

  return (
    <div>
      {canEdit && (
        <div className="mb-4 flex justify-end">
          <Link
            href="/aset/kemaskini"
            className="bg-[#6d28d9] px-4 py-2 font-archivo text-[13px] font-extrabold text-white hover:bg-[#4c1d95]"
          >
            Kemaskini Data
          </Link>
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-l-4 border-[#4a72a8] bg-[var(--white)] p-4 shadow-sm">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[rgba(var(--ink-rgb),0.5)]">Jumlah Aset</div>
          <div className="mt-1.5 text-[24px] font-extrabold text-[var(--ink)]">{fmtNum(jumlahAset)}</div>
        </div>
        <div className="border-l-4 border-[#16a34a] bg-[var(--white)] p-4 shadow-sm">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[rgba(var(--ink-rgb),0.5)]">Aset Baik</div>
          <div className="mt-1.5 text-[24px] font-extrabold text-[var(--ink)]">{fmtNum(jumlahBaik)}</div>
        </div>
        <div className="border-l-4 border-[#E4212B] bg-[var(--white)] p-4 shadow-sm">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[rgba(var(--ink-rgb),0.5)]">Perlu Penyelenggaraan</div>
          <div className="mt-1.5 text-[24px] font-extrabold text-[var(--ink)]">{fmtNum(jumlahRosak)}</div>
        </div>
        <div className="border-l-4 border-[#f59e0b] bg-[var(--white)] p-4 shadow-sm">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[rgba(var(--ink-rgb),0.5)]">Jumlah Lokasi</div>
          <div className="mt-1.5 text-[24px] font-extrabold text-[var(--ink)]">{fmtNum(jumlahLokasi)}</div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="border border-[rgba(var(--ink-rgb),0.2)] bg-[var(--white)] p-[18px] lg:col-span-2">
          <div className="mb-0.5 font-archivo text-[15px] font-extrabold">Aset Mengikut Lokasi (Top 10)</div>
          <div className="mb-3 text-xs text-[rgba(var(--ink-rgb),0.55)]">Bilangan aset baik &amp; rosak setiap lokasi</div>
          <div className="relative h-[320px]">
            <canvas ref={barRef} />
          </div>
        </div>
        <div className="border border-[rgba(var(--ink-rgb),0.2)] bg-[var(--white)] p-[18px]">
          <div className="mb-0.5 font-archivo text-[15px] font-extrabold">Status Aset</div>
          <div className="mb-3 text-xs text-[rgba(var(--ink-rgb),0.55)]">Keseluruhan baik vs rosak</div>
          <div className="relative h-[280px]">
            <canvas ref={donutRef} />
          </div>
        </div>
      </div>

      {jumlahRosak > 0 && (
        <div className="mb-5 flex items-start gap-2.5 border border-[#fecaca] bg-[var(--danger-bg)] p-4">
          <WarningCircle weight="duotone" size={20} className="mt-0.5 flex-none text-[var(--danger)]" />
          <div className="text-[12.5px] text-[var(--danger)]">
            <span className="font-bold">{jumlahRosak} aset</span> berstatus rosak dan memerlukan penyelenggaraan. Jana senarai penuh melalui{" "}
            <span className="font-bold">Cetak Perlu Penyelenggaraan</span> di bawah.
          </div>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-5 border border-[rgba(var(--ink-rgb),0.2)] bg-[var(--white)] p-4">
        <div>
          <label className="mr-2 text-[13px] font-bold text-[rgba(var(--ink-rgb),0.6)]">Lokasi:</label>
          <select value={lokasiSel} onChange={(e) => setLokasiSel(e.target.value)} className="border border-[rgba(var(--ink-rgb),0.3)] px-3 py-1.5 text-sm font-semibold">
            <option value="ALL">Semua Lokasi</option>
            {lokasiList.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 text-[13px] font-bold text-[rgba(var(--ink-rgb),0.6)]">Status:</label>
          <select value={statusSel} onChange={(e) => setStatusSel(e.target.value)} className="border border-[rgba(var(--ink-rgb),0.3)] px-3 py-1.5 text-sm font-semibold">
            <option value="ALL">Semua Status</option>
            <option value="BAIK">Baik</option>
            <option value="ROSAK">Rosak</option>
          </select>
        </div>
        <button
          onClick={() => setShowKewPa7(true)}
          className="border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-4 py-2 font-archivo text-[13px] font-extrabold text-[var(--ink)] hover:bg-[var(--surface)]"
        >
          Cetak KEW.PA 7
        </button>
        <button
          onClick={() => setShowKewPa14(true)}
          className="border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] px-4 py-2 font-archivo text-[13px] font-extrabold text-[var(--ink)] hover:bg-[var(--surface)]"
        >
          Cetak Perlu Penyelenggaraan
        </button>
        <div className="ml-auto text-[12.5px] text-[rgba(var(--ink-rgb),0.55)]">{filtered.length} rekod dipaparkan</div>
      </div>

      <div className="border border-[rgba(var(--ink-rgb),0.2)] bg-[var(--white)] p-[18px]">
        <div className="mb-0.5 font-archivo text-[15px] font-extrabold">Senarai Aset</div>
        <div className="mb-3 text-xs text-[rgba(var(--ink-rgb),0.55)]">Gunakan penapis di atas untuk tumpuan data</div>
        <div className="max-h-[420px] overflow-auto border border-[var(--surface)]">
          <table className="w-full min-w-[680px] border-collapse text-[13px]">
            <thead>
              <tr className="sticky top-0 bg-[#1a1a1a] text-white">
                <th className="px-3 py-2 text-left font-semibold">Nama Aset</th>
                <th className="px-3 py-2 text-left font-semibold">No. Pendaftaran</th>
                <th className="px-3 py-2 text-left font-semibold">Tahun</th>
                <th className="px-3 py-2 text-left font-semibold">Lokasi</th>
                <th className="px-3 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 300).map((r) => (
                <tr key={r.id} className="odd:bg-[var(--white)] even:bg-[var(--surface)]">
                  <td className="border-b border-[var(--surface)] px-3 py-2">{r.namaAset}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2 text-[rgba(var(--ink-rgb),0.6)]">{r.noPendaftaran || "—"}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2 text-[rgba(var(--ink-rgb),0.6)]">{r.tahun || "—"}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2">{r.lokasi}</td>
                  <td className="border-b border-[var(--surface)] px-3 py-2">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white"
                      style={{ background: STATUS_COLORS[r.status] || "#94a3b8" }}
                    >
                      {r.status === "ROSAK" ? "Rosak" : "Baik"}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-[rgba(var(--ink-rgb),0.5)]">
                    Tiada rekod
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {filtered.length > 300 && (
            <div className="border-t border-[var(--surface)] px-3 py-2 text-center text-[11.5px] text-[rgba(var(--ink-rgb),0.5)]">
              Memaparkan 300 daripada {filtered.length} rekod &mdash; gunakan penapis untuk tumpuan
            </div>
          )}
        </div>
      </div>

      {showKewPa7 && (
        <KewPa7Modal
          lokasiList={lokasiSel === "ALL" ? Array.from(byLokasi.keys()).sort() : [lokasiSel]}
          records={records}
          onClose={() => setShowKewPa7(false)}
        />
      )}

      {showKewPa14 && (
        <KewPa14Modal
          items={records.filter((r) => r.status === "ROSAK" && (lokasiSel === "ALL" || r.lokasi === lokasiSel))}
          scopeLabel={lokasiSel === "ALL" ? "Semua Lokasi" : lokasiSel}
          onClose={() => setShowKewPa14(false)}
        />
      )}
    </div>
  );
}
