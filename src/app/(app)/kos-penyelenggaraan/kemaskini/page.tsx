import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import KosPenyelenggaraanKemaskini from "@/components/KosPenyelenggaraanKemaskini";

export default async function KosPenyelenggaraanKemaskiniPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!["SUPERADMIN", "ADMIN", "TEKNIKAL"].includes(session.role)) redirect("/kos-penyelenggaraan");

  return (
    <div>
      <div className="mb-0.5 font-archivo text-[26px] font-extrabold">Kemaskini Data Kos Penyelenggaraan</div>
      <div className="mb-3.5 text-[13.5px] text-[rgba(var(--ink-rgb),0.6)]">Masukkan atau kemaskini rekod kos penyelenggaraan dan pembaikan secara manual</div>
      <div className="mb-4 h-0.5 bg-[rgba(var(--ink-rgb),0.4)]" />
      <KosPenyelenggaraanKemaskini />
    </div>
  );
}
