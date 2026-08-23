"use client";

import { useEffect, useState } from "react";
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
  currentYear: number;
  monthly: MonthlyRow[];
  facilitiesDown: { id: string; name: string; type: string }[];
  repairTypeBreakdown: { type: string; total: number; selesai: number; belumSelesai: number; purataHariSiap: number }[];
  hasilByFacility: { nama: string; rmLabel: string; pct: number }[];
  locationBreakdown: { lokasi: string; count: number; pct: number }[];
  hasilByMonth: { label: string; rmLabel: string; pct: number }[];
  kosByMonth: { label: string; kosLabel: string; kosPct: number }[];
  recurringComplaints: { lokasi: string; isu: string; bil: number; kos: number; kosLabel: string }[];
  topOrganisasi: { label: string; bil: number; pct: number; color: string }[];
  orgRentalGradient: string;
};

export default function ReportsCharts() {
  const [data, setData] = useState<ReportData | null>(null);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) return <p className="text-sm text-[rgba(var(--ink-rgb),0.5)]">Memuatkan laporan...</p>;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.06em] text-[rgba(var(--ink-rgb),0.5)]">Prestasi Aduan</div>
        <div className="border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] p-[18px]">
          <div className="mb-3.5 font-archivo text-sm font-extrabold">Status Aduan Mengikut Bulan</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[380px] border-collapse text-xs">
              <thead>
                <tr>
                  <th className="border-b border-[rgba(var(--ink-rgb),0.3)] py-1.5 pr-0 text-left text-[9.5px] uppercase text-[rgba(var(--ink-rgb),0.55)]">Bulan</th>
                  <th className="border-b border-[rgba(var(--ink-rgb),0.3)] px-0.5 py-1.5 text-right text-[9.5px] uppercase text-[rgba(var(--ink-rgb),0.55)]">Bil. Aduan</th>
                  <th className="border-b border-[rgba(var(--ink-rgb),0.3)] px-0.5 py-1.5 text-right text-[9.5px] uppercase text-[rgba(var(--ink-rgb),0.55)]">Bil. Selesai</th>
                  <th className="border-b border-[rgba(var(--ink-rgb),0.3)] py-1.5 pl-0.5 text-right text-[9.5px] uppercase text-[rgba(var(--ink-rgb),0.55)]">% Selesai</th>
                </tr>
              </thead>
              <tbody>
                {data.monthly.map((m) => (
                  <tr key={m.key}>
                    <td className="border-b border-[rgba(var(--ink-rgb),0.15)] py-1.5 pr-0 font-bold">{m.label}</td>
                    <td className="border-b border-[rgba(var(--ink-rgb),0.15)] px-0.5 py-1.5 text-right">{m.aduan}</td>
                    <td className="border-b border-[rgba(var(--ink-rgb),0.15)] px-0.5 py-1.5 text-right">{m.selesai}</td>
                    <td className="border-b border-[rgba(var(--ink-rgb),0.15)] py-1.5 pl-0.5 text-right font-bold">
                      {m.aduan > 0 ? Math.round((m.selesai / m.aduan) * 100) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="border-t-2 border-[rgba(var(--ink-rgb),0.4)] py-2 font-extrabold">Jumlah</td>
                  <td className="border-t-2 border-[rgba(var(--ink-rgb),0.4)] py-2 text-right font-extrabold">
                    {data.monthly.reduce((s, m) => s + m.aduan, 0)}
                  </td>
                  <td className="border-t-2 border-[rgba(var(--ink-rgb),0.4)] py-2 text-right font-extrabold">
                    {data.monthly.reduce((s, m) => s + m.selesai, 0)}
                  </td>
                  <td className="border-t-2 border-[rgba(var(--ink-rgb),0.4)] py-2 text-right font-extrabold">
                    {(() => {
                      const totalA = data.monthly.reduce((s, m) => s + m.aduan, 0);
                      const totalS = data.monthly.reduce((s, m) => s + m.selesai, 0);
                      return totalA > 0 ? Math.round((totalS / totalA) * 100) : 0;
                    })()}
                    %
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-px border border-[rgba(var(--ink-rgb),0.4)] bg-[rgba(var(--ink-rgb),0.4)] lg:grid-cols-2">
        <div className="bg-[var(--white)] p-[18px]">
          <div className="mb-3.5 font-archivo text-sm font-extrabold">Hasil (RM) Mengikut Bulan</div>
          <div className="flex h-[150px] items-end gap-1.5">
            {data.hasilByMonth.map((m) => (
              <div key={m.label} className="flex h-full flex-1 flex-col items-center justify-end">
                <div className="mb-0.5 text-[8.5px] font-bold text-[rgba(var(--ink-rgb),0.6)]">{m.rmLabel}</div>
                <div className="w-full bg-[#4a72a8]" style={{ height: `${m.pct}%` }} />
                <div className="mt-1 text-[10px] font-bold text-[rgba(var(--ink-rgb),0.55)]">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[var(--white)] p-[18px]">
          <div className="mb-3.5 font-archivo text-sm font-extrabold">Kos Penyelenggaraan Mengikut Bulan</div>
          <div className="flex h-[150px] items-end gap-3.5">
            {data.kosByMonth.map((m) => (
              <div key={m.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <div className="text-[9.5px] font-bold text-[rgba(var(--ink-rgb),0.7)]">{m.kosLabel}</div>
                <div className="w-full bg-[#8a6d1f]" style={{ height: `${m.kosPct}%` }} />
                <div className="text-[10.5px] font-bold text-[rgba(var(--ink-rgb),0.6)]">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.06em] text-[rgba(var(--ink-rgb),0.5)]">Fasiliti &amp; Organisasi</div>
        <div className="grid grid-cols-1 gap-px border border-[rgba(var(--ink-rgb),0.4)] bg-[rgba(var(--ink-rgb),0.4)] lg:grid-cols-2">
          <div className="bg-[var(--white)] p-[18px]">
            <div className="mb-3.5 font-archivo text-sm font-extrabold">Hasil Mengikut Fasiliti ({data.currentYear})</div>
            {data.hasilByFacility.length === 0 && <p className="text-xs text-[rgba(var(--ink-rgb),0.5)]">Tiada data.</p>}
            <div className="flex flex-col gap-2.5">
              {data.hasilByFacility.map((f) => (
                <div key={f.nama}>
                  <div className="mb-1 flex justify-between text-[11.5px] font-bold">
                    <span>{f.nama}</span>
                    <span>{f.rmLabel}</span>
                  </div>
                  <div className="h-2 bg-[#e2e1e0]">
                    <div className="h-full bg-[#4a72a8]" style={{ width: `${f.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[var(--white)] p-[18px]">
            <div className="mb-3.5 font-archivo text-sm font-extrabold">Punca Aduan Mengikut Lokasi ({data.currentYear})</div>
            {data.locationBreakdown.length === 0 && <p className="text-xs text-[rgba(var(--ink-rgb),0.5)]">Tiada data.</p>}
            <div className="flex flex-col gap-2.5">
              {data.locationBreakdown.map((l) => (
                <div key={l.lokasi}>
                  <div className="mb-1 flex justify-between text-[11.5px] font-bold">
                    <span>{l.lokasi}</span>
                    <span>
                      {l.count} ({l.pct}%)
                    </span>
                  </div>
                  <div className="h-2 bg-[#e2e1e0]">
                    <div className="h-full bg-[#201e1d]" style={{ width: `${l.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-px border border-[rgba(var(--ink-rgb),0.4)] bg-[rgba(var(--ink-rgb),0.4)] lg:grid-cols-2">
        <div className="overflow-x-auto bg-[var(--white)] p-[18px]">
          <div className="mb-3.5 font-archivo text-sm font-extrabold">Top 5 Aduan Berulang — Jenis Kerosakan ({data.currentYear})</div>
          {data.recurringComplaints.length === 0 && <p className="text-xs text-[rgba(var(--ink-rgb),0.5)]">Tiada data.</p>}
          <table className="w-full min-w-[260px] border-collapse text-xs">
            <thead>
              <tr>
                <th className="border-b border-[rgba(var(--ink-rgb),0.2)] py-1.5 text-left text-[9.5px] uppercase text-[rgba(var(--ink-rgb),0.55)]">
                  Lokasi / Jenis Kerosakan
                </th>
                <th className="border-b border-[rgba(var(--ink-rgb),0.2)] py-1.5 text-right text-[9.5px] uppercase text-[rgba(var(--ink-rgb),0.55)]">
                  Bil.
                </th>
                <th className="border-b border-[rgba(var(--ink-rgb),0.2)] py-1.5 text-right text-[9.5px] uppercase text-[rgba(var(--ink-rgb),0.55)]">
                  Kos
                </th>
              </tr>
            </thead>
            <tbody>
              {data.recurringComplaints.map((r) => (
                <tr key={`${r.lokasi}-${r.isu}`}>
                  <td className="border-b border-[rgba(var(--ink-rgb),0.1)] py-1.5">
                    <div className="font-bold">{r.isu}</div>
                    <div className="text-[11px] text-[rgba(var(--ink-rgb),0.55)]">{r.lokasi}</div>
                  </td>
                  <td className="border-b border-[rgba(var(--ink-rgb),0.1)] py-1.5 text-right font-bold">{r.bil}</td>
                  <td className="border-b border-[rgba(var(--ink-rgb),0.1)] py-1.5 text-right font-bold">{r.kosLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-[var(--white)] p-[18px]">
          <div className="mb-3.5 font-archivo text-sm font-extrabold">Top 5 Organisasi Penyewa Fasiliti ({data.currentYear})</div>
          {data.topOrganisasi.length === 0 ? (
            <p className="text-xs text-[rgba(var(--ink-rgb),0.5)]">Tiada data.</p>
          ) : (
            <div className="flex items-center gap-[18px]">
              <div className="h-[120px] w-[120px] flex-none rounded-full" style={{ background: data.orgRentalGradient }} />
              <div className="flex flex-1 flex-col gap-1.5 text-[11.5px]">
                {data.topOrganisasi.map((o) => (
                  <div key={o.label} className="flex items-center gap-1.5">
                    <span className="h-2 w-2 flex-none" style={{ background: o.color }} />
                    <span className="flex-1">{o.label}</span>
                    <span className="font-bold">{o.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-px border border-[rgba(var(--ink-rgb),0.4)] bg-[rgba(var(--ink-rgb),0.4)] lg:grid-cols-2">
        {data.repairTypeBreakdown.map((r) => (
          <div key={r.type} className="bg-[var(--white)] p-[18px]">
            <div className="mb-3.5 font-archivo text-sm font-extrabold">
              {REPAIR_TYPE_LABEL[r.type]} ({data.currentYear})
            </div>
            <div className="text-xs text-[rgba(var(--ink-rgb),0.6)]">
              Jumlah: <strong className="text-[var(--ink)]">{r.total}</strong> · Selesai:{" "}
              <strong className="text-[var(--success)]">{r.selesai}</strong> · Pending:{" "}
              <strong className="text-[var(--danger)]">{r.belumSelesai}</strong>
            </div>
            <div className="mt-1.5 text-xs text-[rgba(var(--ink-rgb),0.6)]">
              Purata masa penyelesaian: <strong className="text-[var(--ink)]">{r.purataHariSiap} hari</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] p-[18px]">
        <div className="mb-3.5 font-archivo text-sm font-extrabold">Fasiliti Dalam Penyelenggaraan</div>
        {data.facilitiesDown.length === 0 && <p className="text-xs text-[rgba(var(--ink-rgb),0.5)]">Tiada fasiliti dalam penyelenggaraan.</p>}
        <div className="flex flex-col gap-2">
          {data.facilitiesDown.map((f) => (
            <div key={f.id} className="bg-[var(--danger-bg)] px-3.5 py-2.5 text-sm text-[var(--danger)]">
              {f.name} <span className="text-xs">({f.type})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
