import ReportsCharts from "@/components/ReportsCharts";

export default function LaporanPage() {
  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-800">Laporan & Analitik</h1>
      <p className="mb-6 text-sm text-slate-500">
        Laporan bulanan aduan, hasil sewaan fasiliti dan kos penyelenggaraan.
      </p>
      <ReportsCharts />
    </div>
  );
}
