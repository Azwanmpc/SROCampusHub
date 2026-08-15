import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import PinjamanAsetView from "@/components/PinjamanAsetView";

export default async function BorangPinjamanAsetPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "STAFF_MPC") redirect("/dashboard");

  return (
    <div>
      <div className="mb-0.5 font-archivo text-[26px] font-extrabold">Borang Pinjaman Aset</div>
      <div className="mb-3.5 text-[13.5px] text-[rgba(32,30,29,0.6)]">
        Borang permohonan pinjaman aset alih dan status permohonan anda
      </div>
      <div className="mb-4 h-0.5 bg-[rgba(32,30,29,0.4)]" />
      <PinjamanAsetView userId={session.userId} role={session.role} />
    </div>
  );
}
