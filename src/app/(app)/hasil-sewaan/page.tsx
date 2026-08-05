import HasilSewaanDashboard from "@/components/HasilSewaanDashboard";

export default function HasilSewaanPage() {
  return (
    <div>
      <div className="mb-0.5 font-archivo text-[26px] font-extrabold">Dashboard Hasil Sewaan Kemudahan</div>
      <div className="mb-3.5 text-[13.5px] text-[rgba(32,30,29,0.6)]">Perbandingan hasil sewaan kemudahan MPC Wilayah Selatan mengikut tahun</div>
      <div className="mb-4 h-0.5 bg-[rgba(32,30,29,0.4)]" />
      <HasilSewaanDashboard />
    </div>
  );
}
