import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import FacilityCard from "@/components/FacilityCard";
import EquipmentAddonList from "@/components/EquipmentAddonList";

export default async function FasilitiPage() {
  const session = await getSession();
  const isStaff = session?.role === "SUPERADMIN" || session?.role === "ADMIN";
  const facilities = await prisma.facility.findMany({ orderBy: { name: "asc" } });
  const asramaRoomTypes = await prisma.asramaRoomType.findMany({ orderBy: { key: "asc" } });
  const equipmentAddonsRaw = await prisma.equipmentAddon.findMany({ orderBy: { key: "asc" } });
  const equipmentAddons = equipmentAddonsRaw.map((a) => ({ ...a, appliesTo: JSON.parse(a.appliesTo) as string[] }));

  return (
    <div>
      <div className="mb-0.5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-0.5 font-archivo text-[26px] font-extrabold">Maklumat Fasiliti</div>
          <div className="text-[13.5px] text-[rgba(var(--ink-rgb),0.6)]">
            Senarai fasiliti kampus, kadar sewaan &amp; status semasa
          </div>
        </div>
        <div className="flex-none bg-[#201e1d] px-4 py-2.5 text-right font-archivo text-[12.5px] font-bold text-[#f3f2f2]">
          Sila Hubungi: En Mohd Hykal B Mohd Halim
          <br />
          0187734506
        </div>
      </div>
      <div className="my-[18px] h-0.5 bg-[rgba(var(--ink-rgb),0.4)]" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map((f) => (
          <FacilityCard
            key={f.id}
            facility={f}
            isStaff={isStaff}
            asramaRoomTypes={f.type === "Asrama" ? asramaRoomTypes : undefined}
          />
        ))}
      </div>

      <div className="mt-[18px] border border-[rgba(var(--ink-rgb),0.4)] bg-[var(--white)] p-[18px]">
        <div className="mb-3 font-archivo text-sm font-extrabold">Add-On Peralatan</div>
        <EquipmentAddonList addons={equipmentAddons} isStaff={isStaff} />
      </div>

      <div className="mt-[18px] grid grid-cols-1 gap-px border border-[rgba(var(--ink-rgb),0.4)] bg-[rgba(var(--ink-rgb),0.3)] md:grid-cols-2">
        <div className="bg-[var(--white)] p-[18px]">
          <div className="mb-3 font-archivo text-sm font-extrabold">Kemudahan Lain</div>
          <div className="flex flex-col gap-2.5 text-[12.5px]">
            <div><strong>Surau Al-Firdaus</strong> — Ruang solat, kapasiti 100 jemaah</div>
            <div><strong>Kemudahan Parking</strong> — 117 lot tersedia</div>
            <div><strong>Kemudahan Riadah</strong> — Ruang aktiviti luar/gelanggang</div>
          </div>
        </div>
        <div className="bg-[var(--white)] p-[18px]">
          <div className="mb-3 font-archivo text-sm font-extrabold">Perkhidmatan Makanan</div>
          <div className="text-[12.5px] text-[rgba(var(--ink-rgb),0.7)]">
            Untuk perkhidmatan penyedia makanan (caterer), sila hubungi pihak admin En Hykal: 018-7734506.
          </div>
        </div>
      </div>
    </div>
  );
}
