"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Chart, registerables } from "chart.js";
import { WarningCircle } from "@phosphor-icons/react";
import { generateKewPa7, generateKewPa8, generateKewPa14 } from "@/lib/asetPdf";

Chart.register(...registerables);

type Aset = { id: string; namaAset: string; noPendaftaran: string; tahun: string | null; lokasi: string; status: string };

const STATUS_COLORS: Record<string, string> = { BAIK: "#16a34a", ROSAK: "#E4212B" };

function fmtNum(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

export default function AsetDashboard() {
  const [records, setRecords] = useState<Aset[] | null>(null);
  const [lokasiSel, setLokasiSel] = useState("ALL");
  const [statusSel, setStatusSel] = useState("ALL");

  const barRef = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);
  const barChart = useRef<any>(null);
  const donutChart = useRef<any>(null);

  function load() {
    fetch("/api/aset")
      .then((r) => r.json())
      .then(setRecords);
  }

  useEffect(load, []);

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
          plugins: { legend: { position: "top" } },
          scales: { x: { stacked: true }, y: { stacked: true, ticks: { precision: 0 } } },
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
          plugins: { legend: { position: "bottom" } },
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [records]);

  if (!records) return <p className="text-sm text-[rgba(32,30,29,0.5)]">Memuatkan dashboard...</p>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap justify-end gap-2">
        <button
          onClick={() => generateKewPa7(Array.from(byLokasi.keys()).sort(), records)}
          className="border border-[rgba(32,30,29,0.4)] bg-white px-4 py-2 font-archivo text-[13px] font-extrabold text-[#201e1d] hover:bg-[#f7f6f6]"
        >
          KEW.PA-7 Senarai Aset
        </button>
        <button
          onClick={() => generateKewPa8(byLokasi)}
          className="border border-[rgba(32,30,29,0.4)] bg-white px-4 py-2 font-archivo text-[13px] font-extrabold text-[#201e1d] hover:bg-[#f7f6f6]"
        >
          KEW.PA-8 Kedudukan Aset
        </button>
        <button
          onClick={() => generateKewPa14(records.filter((r) => r.status === "ROSAK"))}
          className="border border-[rgba(32,30,29,0.4)] bg-white px-4 py-2 font-archivo text-[13px] font-extrabold text-[#201e1d] hover:bg-[#f7f6f6]"
        >
          KEW.PA-14 Perlu Penyelenggaraan
        </button>
        <Link
          href="/aset/kemaskini"
          className="bg-[#6d28d9] px-4 py-2 font-archivo text-[13px] font-extrabold text-white hover:bg-[#4c1d95]"
        >
          Kemaskini Data
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="border-l-4 border-[#4a72a8] bg-white p-4 shadow-sm">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[rgba(32,30,29,0.5)]">Jumlah Aset</div>
          <div className="mt-1.5 text-[24px] font-extrabold text-[#1a1a1a]">{fmtNum(jumlahAset)}</div>
        </div>
        <div className="border-l-4 border-[#16a34a] bg-white p-4 shadow-sm">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[rgba(32,30,29,0.5)]">Aset Baik</div>
          <div className="mt-1.5 text-[24px] font-extrabold text-[#1a1a1a]">{fmtNum(jumlahBaik)}</div>
        </div>
        <div className="border-l-4 border-[#E4212B] bg-white p-4 shadow-sm">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[rgba(32,30,29,0.5)]">Perlu Penyelenggaraan</div>
          <div className="mt-1.5 text-[24px] font-extrabold text-[#1a1a1a]">{fmtNum(jumlahRosak)}</div>
        </div>
        <div className="border-l-4 border-[#f59e0b] bg-white p-4 shadow-sm">
          <div className="text-[11.5px] font-bold uppercase tracking-[0.04em] text-[rgba(32,30,29,0.5)]">Jumlah Lokasi</div>
          <div className="mt-1.5 text-[24px] font-extrabold text-[#1a1a1a]">{fmtNum(jumlahLokasi)}</div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="border border-[rgba(32,30,29,0.2)] bg-white p-[18px] lg:col-span-2">
          <div className="mb-0.5 font-archivo text-[15px] font-extrabold">Aset Mengikut Lokasi (Top 10)</div>
          <div className="mb-3 text-xs text-[rgba(32,30,29,0.55)]">Bilangan aset baik &amp; rosak setiap lokasi</div>
          <div className="relative h-[320px]">
            <canvas ref={barRef} />
          </div>
        </div>
        <div className="border border-[rgba(32,30,29,0.2)] bg-white p-[18px]">
          <div className="mb-0.5 font-archivo text-[15px] font-extrabold">Status Aset</div>
          <div className="mb-3 text-xs text-[rgba(32,30,29,0.55)]">Keseluruhan baik vs rosak</div>
          <div className="relative h-[280px]">
            <canvas ref={donutRef} />
          </div>
        </div>
      </div>

      {jumlahRosak > 0 && (
        <div className="mb-5 flex items-start gap-2.5 border border-[#fecaca] bg-[#fff2ef] p-4">
          <WarningCircle weight="duotone" size={20} className="mt-0.5 flex-none text-[#7c1405]" />
          <div className="text-[12.5px] text-[#7c1405]">
            <span className="font-bold">{jumlahRosak} aset</span> berstatus rosak dan memerlukan penyelenggaraan. Jana senarai penuh melalui{" "}
            <span className="font-bold">KEW.PA-14</span> di atas.
          </div>
        </div>
      )}

      <div className="mb-5 flex flex-wrap items-center gap-5 border border-[rgba(32,30,29,0.2)] bg-white p-4">
        <div>
          <label className="mr-2 text-[13px] font-bold text-[rgba(32,30,29,0.6)]">Lokasi:</label>
          <select value={lokasiSel} onChange={(e) => setLokasiSel(e.target.value)} className="border border-[rgba(32,30,29,0.3)] px-3 py-1.5 text-sm font-semibold">
            <option value="ALL">Semua Lokasi</option>
            {lokasiList.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mr-2 text-[13px] font-bold text-[rgba(32,30,29,0.6)]">Status:</label>
          <select value={statusSel} onChange={(e) => setStatusSel(e.target.value)} className="border border-[rgba(32,30,29,0.3)] px-3 py-1.5 text-sm font-semibold">
            <option value="ALL">Semua Status</option>
            <option value="BAIK">Baik</option>
            <option value="ROSAK">Rosak</option>
          </select>
        </div>
        <div className="ml-auto text-[12.5px] text-[rgba(32,30,29,0.55)]">{filtered.length} rekod dipaparkan</div>
      </div>

      <div className="border border-[rgba(32,30,29,0.2)] bg-white p-[18px]">
        <div className="mb-0.5 font-archivo text-[15px] font-extrabold">Senarai Aset</div>
        <div className="mb-3 text-xs text-[rgba(32,30,29,0.55)]">Gunakan penapis di atas untuk tumpuan data</div>
        <div className="max-h-[420px] overflow-auto border border-[#eef0f4]">
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
                <tr key={r.id} className="odd:bg-white even:bg-[#fafbfd]">
                  <td className="border-b border-[#eef0f4] px-3 py-2">{r.namaAset}</td>
                  <td className="border-b border-[#eef0f4] px-3 py-2 text-[rgba(32,30,29,0.6)]">{r.noPendaftaran || "—"}</td>
                  <td className="border-b border-[#eef0f4] px-3 py-2 text-[rgba(32,30,29,0.6)]">{r.tahun || "—"}</td>
                  <td className="border-b border-[#eef0f4] px-3 py-2">{r.lokasi}</td>
                  <td className="border-b border-[#eef0f4] px-3 py-2">
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
                  <td colSpan={5} className="px-3 py-6 text-center text-sm text-[rgba(32,30,29,0.5)]">
                    Tiada rekod
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {filtered.length > 300 && (
            <div className="border-t border-[#eef0f4] px-3 py-2 text-center text-[11.5px] text-[rgba(32,30,29,0.5)]">
              Memaparkan 300 daripada {filtered.length} rekod &mdash; gunakan penapis untuk tumpuan
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
