import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import StatusBadge from "@/components/StatusBadge";
import FacilityStatusSelect from "@/components/FacilityStatusSelect";
import { FACILITY_STATUS_LABEL, FACILITY_STATUS_COLOR } from "@/lib/constants";

export default async function FasilitiPage() {
  const session = await getSession();
  const isStaff = session?.role === "SUPERADMIN" || session?.role === "ADMIN";
  const facilities = await prisma.facility.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-800">Maklumat Fasiliti</h1>
      <p className="mb-6 text-sm text-slate-500">Senarai fasiliti kampus dan status semasa.</p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map((f) => (
          <div key={f.id} className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-bold text-slate-800">{f.name}</div>
                <div className="text-xs text-slate-400">{f.type}</div>
              </div>
              {isStaff ? (
                <FacilityStatusSelect facilityId={f.id} status={f.status} />
              ) : (
                <StatusBadge label={FACILITY_STATUS_LABEL[f.status]} colorClass={FACILITY_STATUS_COLOR[f.status]} />
              )}
            </div>
            <p className="mb-3 text-xs text-slate-500">{f.description}</p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Kapasiti: <strong className="text-slate-700">{f.capacity} orang</strong></span>
              <span>Kos: <strong className="text-slate-700">RM {f.costPerUse.toLocaleString("ms-MY")}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
