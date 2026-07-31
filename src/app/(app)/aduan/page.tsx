import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ComplaintForm from "@/components/ComplaintForm";
import ComplaintList from "@/components/ComplaintList";

export default async function AduanPage() {
  const session = await getSession();
  if (!session) return null;
  const isStaff = ["SUPERADMIN", "ADMIN", "TEKNIKAL"].includes(session.role);

  const [facilities, complaints] = await Promise.all([
    prisma.facility.findMany({ orderBy: { name: "asc" } }),
    prisma.complaint.findMany({
      where: isStaff ? {} : { userId: session.userId },
      include: { facility: true, user: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const complaintsForClient = complaints.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div>
      <div className="mb-0.5 font-archivo text-[26px] font-extrabold">
        {isStaff ? "Senarai Aduan Kerosakan" : "Aduan Saya"}
      </div>
      <div className="mb-3.5 text-[13.5px] text-[rgba(32,30,29,0.6)]">
        {isStaff ? "Status aduan & jenis pembaikan" : "Buat aduan kerosakan baharu dan jejak statusnya"}
      </div>
      <div className="mb-4 h-0.5 bg-[rgba(32,30,29,0.4)]" />

      <div className={`grid grid-cols-1 gap-6 ${isStaff ? "" : "xl:grid-cols-3"}`}>
        {!isStaff && (
          <div className="border border-[rgba(32,30,29,0.4)] bg-white p-6">
            <div className="mb-4 font-archivo text-sm font-extrabold">Borang Aduan Baharu</div>
            <ComplaintForm facilities={facilities} role={session.role} />
          </div>
        )}

        <div className={isStaff ? "" : "xl:col-span-2"}>
          <ComplaintList complaints={complaintsForClient} role={session.role} showFilters={isStaff} />
        </div>
      </div>
    </div>
  );
}
