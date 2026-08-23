import AsetDashboard from "@/components/AsetDashboard";
import { getSession } from "@/lib/auth";

export default async function AsetPage() {
  const session = await getSession();
  const canEdit = session?.role === "SUPERADMIN" || session?.role === "ADMIN";

  return (
    <div>
      <div className="mb-0.5 font-archivo text-[26px] font-extrabold">Dashboard Aset</div>
      <div className="mb-3.5 text-[13.5px] text-[rgba(32,30,29,0.6)]">
        Daftar aset, lokasi dan status penyelenggaraan berkala
      </div>
      <div className="mb-4 h-0.5 bg-[rgba(32,30,29,0.4)]" />
      <AsetDashboard canEdit={canEdit} />
    </div>
  );
}
