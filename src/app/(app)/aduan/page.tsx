import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ComplaintForm from "@/components/ComplaintForm";
import ComplaintStatusControl from "@/components/ComplaintStatusControl";
import StatusBadge from "@/components/StatusBadge";
import { COMPLAINT_STATUS_LABEL, COMPLAINT_STATUS_COLOR, REPAIR_TYPE_LABEL } from "@/lib/constants";

export default async function AduanPage() {
  const session = await getSession();
  if (!session) return null;
  const isStaff = session.role === "SUPERADMIN" || session.role === "ADMIN";

  const [facilities, complaints] = await Promise.all([
    prisma.facility.findMany({ orderBy: { name: "asc" } }),
    prisma.complaint.findMany({
      where: isStaff ? {} : { userId: session.userId },
      include: { facility: true, user: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-800">Aduan Kerosakan</h1>
      <p className="mb-6 text-sm text-slate-500">
        {isStaff ? "Urus dan kemas kini status aduan kerosakan." : "Buat aduan kerosakan baharu dan jejak statusnya."}
      </p>

      <div className={`grid grid-cols-1 gap-6 ${isStaff ? "" : "xl:grid-cols-3"}`}>
        {!isStaff && (
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-bold text-slate-800">Borang Aduan Baharu</h2>
            <ComplaintForm facilities={facilities} />
          </div>
        )}

        <div className={isStaff ? "" : "xl:col-span-2"}>
          <h2 className="mb-3 text-sm font-bold text-slate-700">
            {isStaff ? "Semua Aduan" : "Aduan Saya"} ({complaints.length})
          </h2>
          <div className="flex flex-col gap-3">
            {complaints.length === 0 && <p className="text-sm text-slate-400">Tiada aduan.</p>}
            {complaints.map((c) => (
              <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-bold text-slate-800">{c.location}</div>
                    <div className="text-xs text-slate-500">
                      {c.user.name} &middot; {new Date(c.createdAt).toLocaleString("ms-MY")}
                    </div>
                  </div>
                  <StatusBadge label={COMPLAINT_STATUS_LABEL[c.status]} colorClass={COMPLAINT_STATUS_COLOR[c.status]} />
                </div>
                <p className="mb-3 text-sm text-slate-600">{c.description}</p>
                {c.photoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.photoUrl} alt="Gambar aduan" className="mb-3 h-40 w-40 rounded-md object-cover" />
                )}
                {c.repairType && !isStaff && (
                  <div className="mb-2 text-xs text-slate-500">
                    Jenis pembaikan: {REPAIR_TYPE_LABEL[c.repairType]}
                  </div>
                )}
                {isStaff && (
                  <ComplaintStatusControl complaintId={c.id} status={c.status} repairType={c.repairType} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
