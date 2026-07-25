import { prisma } from "@/lib/prisma";
import CalendarView from "@/components/CalendarView";

export default async function KalendarPage() {
  const facilities = await prisma.facility.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-800">Kalendar & Tempahan Fasiliti</h1>
      <p className="mb-6 text-sm text-slate-500">
        Lihat slot tersedia/ditempah dan buat tempahan fasiliti baharu.
      </p>
      <CalendarView facilities={facilities} />
    </div>
  );
}
