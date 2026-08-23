import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import FacilityCard from "@/components/FacilityCard";

export default async function FasilitiPage() {
  const session = await getSession();
  const isStaff = session?.role === "SUPERADMIN" || session?.role === "ADMIN";
  const facilities = await prisma.facility.findMany({ orderBy: { name: "asc" } });

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
          <FacilityCard key={f.id} facility={f} isStaff={isStaff} />
        ))}
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
          <div className="mb-3 font-archivo text-sm font-extrabold">Pakej Makanan (Setiap Pax)</div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="border-b border-[rgba(var(--ink-rgb),0.2)] py-1.5 text-left text-[9.5px] uppercase text-[rgba(var(--ink-rgb),0.55)]">Pakej</th>
                <th className="border-b border-[rgba(var(--ink-rgb),0.2)] py-1.5 text-right text-[9.5px] uppercase text-[rgba(var(--ink-rgb),0.55)]">Makan Tengahari/Malam</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border-b border-[rgba(var(--ink-rgb),0.1)] py-1.5">Pakej A</td><td className="border-b border-[rgba(var(--ink-rgb),0.1)] py-1.5 text-right font-bold">RM 26.00</td></tr>
              <tr><td className="border-b border-[rgba(var(--ink-rgb),0.1)] py-1.5">Pakej B</td><td className="border-b border-[rgba(var(--ink-rgb),0.1)] py-1.5 text-right font-bold">RM 20.00</td></tr>
              <tr><td className="py-1.5">Pakej C</td><td className="py-1.5 text-right font-bold">RM 15.00</td></tr>
            </tbody>
          </table>
          <div className="mt-2 text-[11px] text-[rgba(var(--ink-rgb),0.55)]">
            Termasuk sarapan, minum pagi/petang/malam. Hubungi pihak MPC untuk tempahan katering.
          </div>
        </div>
      </div>
    </div>
  );
}
