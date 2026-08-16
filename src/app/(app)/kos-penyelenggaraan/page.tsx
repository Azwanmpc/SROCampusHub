import { getSession } from "@/lib/auth";
import KosPenyelenggaraanDashboard from "@/components/KosPenyelenggaraanDashboard";

export default async function KosPenyelenggaraanPage() {
  const session = await getSession();
  const canEdit = ["SUPERADMIN", "ADMIN", "TEKNIKAL"].includes(session?.role ?? "");

  return (
    <div>
      <div className="mb-0.5 font-archivo text-[26px] font-extrabold">Dashboard Kos Penyelenggaraan</div>
      <div className="mb-3.5 text-[13.5px] text-[rgba(32,30,29,0.6)]">Kos penyelenggaraan dan pembaikan fasiliti MPC Wilayah Selatan</div>
      <div className="mb-4 h-0.5 bg-[rgba(32,30,29,0.4)]" />
      <KosPenyelenggaraanDashboard canEdit={canEdit} />
    </div>
  );
}
