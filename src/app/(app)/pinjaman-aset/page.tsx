import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import PinjamanAsetView from "@/components/PinjamanAsetView";

export default async function PinjamanAsetPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (!["SUPERADMIN", "ADMIN", "PEMINJAM"].includes(session.role)) redirect("/dashboard");

  const isStaff = session.role === "SUPERADMIN" || session.role === "ADMIN";

  return (
    <div>
      <div className="mb-0.5 font-archivo text-[26px] font-extrabold">{isStaff ? "Kelulusan Pinjaman Aset" : "Pinjaman Aset"}</div>
      <div className="mb-3.5 text-[13.5px] text-[rgba(var(--ink-rgb),0.6)]">
        {isStaff ? "Sahkan permohonan pinjaman aset dan pengesahan pemulangan" : "Borang permohonan pinjaman aset alih dan status permohonan anda"}
      </div>
      <div className="mb-4 h-0.5 bg-[rgba(var(--ink-rgb),0.4)]" />
      <PinjamanAsetView userId={session.userId} role={session.role} />
    </div>
  );
}
