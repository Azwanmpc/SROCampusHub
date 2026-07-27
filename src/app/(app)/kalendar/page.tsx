import { prisma } from "@/lib/prisma";
import CalendarView from "@/components/CalendarView";

export default async function KalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ facility?: string }>;
}) {
  const { facility } = await searchParams;
  const facilities = await prisma.facility.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="mb-0.5 font-archivo text-[26px] font-extrabold">Kalendar Tempahan</div>
      <div className="mb-3.5 text-[13.5px] text-[rgba(32,30,29,0.6)]">
        Lihat slot fasiliti tersedia &amp; ditempah
      </div>
      <div className="mb-[18px] h-0.5 bg-[rgba(32,30,29,0.4)]" />
      <CalendarView facilities={facilities} defaultFacilityId={facility} />
    </div>
  );
}
