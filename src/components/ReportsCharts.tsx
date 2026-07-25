"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { REPAIR_TYPE_LABEL } from "@/lib/constants";

type MonthlyRow = {
  key: string;
  label: string;
  aduan: number;
  selesai: number;
  hasil: number;
  kosPenyelenggaraan: number;
};

type ReportData = {
  monthly: MonthlyRow[];
  facilitiesDown: { id: string; name: string; type: string }[];
  repairTypeBreakdown: { type: string; total: number; selesai: number; belumSelesai: number; purataHariSiap: number }[];
};

export default function ReportsCharts() {
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-sm text-slate-400">Memuatkan laporan...</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-bold text-slate-800">Bilangan Aduan vs Status Siap (Bulanan)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data.monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="aduan" name="Jumlah Aduan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="selesai" name="Selesai" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-bold text-slate-800">Hasil Sewaan vs Kos Penyelenggaraan (RM)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data.monthly}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="hasil" name="Hasil Sewaan" stroke="#4f46e5" strokeWidth={2} />
            <Line type="monotone" dataKey="kosPenyelenggaraan" name="Kos Penyelenggaraan" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-bold text-slate-800">Prestasi Mengikut Jenis Pembaikan</h2>
          <div className="flex flex-col gap-3">
            {data.repairTypeBreakdown.map((r) => (
              <div key={r.type} className="rounded-lg border border-slate-100 p-3">
                <div className="mb-1 text-sm font-semibold text-slate-700">{REPAIR_TYPE_LABEL[r.type]}</div>
                <div className="text-xs text-slate-500">
                  Jumlah: {r.total} &middot; Selesai: {r.selesai} &middot; Pending: {r.belumSelesai} &middot; Purata:{" "}
                  {r.purataHariSiap} hari
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-bold text-slate-800">Fasiliti Dalam Penyelenggaraan</h2>
          {data.facilitiesDown.length === 0 && (
            <p className="text-sm text-slate-400">Tiada fasiliti dalam penyelenggaraan.</p>
          )}
          <div className="flex flex-col gap-2">
            {data.facilitiesDown.map((f) => (
              <div key={f.id} className="rounded-lg bg-yellow-50 px-3 py-2 text-sm text-yellow-800">
                {f.name} <span className="text-xs text-yellow-600">({f.type})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
