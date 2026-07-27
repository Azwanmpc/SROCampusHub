import ReportsCharts from "@/components/ReportsCharts";

export default function LaporanPage() {
  return (
    <div>
      <div className="mb-0.5 font-archivo text-[26px] font-extrabold">Laporan &amp; Analitik</div>
      <div className="mb-3.5 text-[13.5px] text-[rgba(32,30,29,0.6)]">
        Laporan bulanan aduan, hasil sewaan fasiliti dan kos penyelenggaraan
      </div>
      <div className="mb-5 h-0.5 bg-[rgba(32,30,29,0.4)]" />
      <ReportsCharts />
    </div>
  );
}
