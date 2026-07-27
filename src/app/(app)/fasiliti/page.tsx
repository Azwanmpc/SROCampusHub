import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Users, PencilSimple } from "@phosphor-icons/react/dist/ssr";
import StatusBadge from "@/components/StatusBadge";
import FacilityStatusSelect from "@/components/FacilityStatusSelect";
import { FACILITY_STATUS_LABEL, FACILITY_STATUS_COLOR } from "@/lib/constants";
import Link from "next/link";

export default async function FasilitiPage() {
  const session = await getSession();
  const isStaff = session?.role === "SUPERADMIN" || session?.role === "ADMIN";
  const facilities = await prisma.facility.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <div className="mb-0.5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-0.5 font-archivo text-[26px] font-extrabold">Maklumat Fasiliti</div>
          <div className="text-[13.5px] text-[rgba(32,30,29,0.6)]">
            Senarai fasiliti kampus, kadar sewaan &amp; status semasa
          </div>
        </div>
        <div className="flex-none bg-[#201e1d] px-4 py-2.5 text-right font-archivo text-[12.5px] font-bold text-[#f3f2f2]">
          Sila Hubungi: En Mohd Hykal B Mohd Halim
          <br />
          0187734506
        </div>
      </div>
      <div className="my-[18px] h-0.5 bg-[rgba(32,30,29,0.4)]" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {facilities.map((f) => {
          const isAsrama = f.type === "Asrama";
          const canBook = f.status !== "PENYELENGGARAAN";
          return (
            <div key={f.id} className="flex h-full flex-col border border-[rgba(32,30,29,0.3)] bg-white">
              <div className="flex h-[110px] items-center justify-center bg-[repeating-linear-gradient(135deg,#e7e5e5_0_10px,#d7d3d3_10px_20px)] text-xs font-semibold text-[rgba(32,30,29,0.4)]">
                Gambar {f.name}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <div className="text-[14.5px] font-bold">{f.name}</div>
                  <StatusBadge label={FACILITY_STATUS_LABEL[f.status]} colorClass={FACILITY_STATUS_COLOR[f.status]} />
                </div>
                <div className="mb-2 text-[12.5px] text-[rgba(32,30,29,0.6)]">{f.description}</div>
                <div className="mb-2.5 flex items-center gap-1.5 text-xs font-semibold">
                  <Users weight="duotone" size={16} />
                  {f.capacity} Pax
                </div>

                {isAsrama ? (
                  <div className="mb-3 bg-[#f3f2f2] px-2.5 py-2">
                    <div className="text-[9.5px] font-bold uppercase tracking-[0.03em] text-[rgba(32,30,29,0.55)]">
                      Kadar Bilik
                    </div>
                    <div className="mt-0.5 text-xs">
                      Suit Eksekutif: RM150/malam · Bilik Biasa: RM70/malam · Dorm: RM150/malam
                    </div>
                  </div>
                ) : f.halfDayRate != null ? (
                  <div className="mb-3 flex gap-px border border-[rgba(32,30,29,0.15)] bg-[rgba(32,30,29,0.15)]">
                    <div className="flex-1 bg-[#f3f2f2] px-2.5 py-2">
                      <div className="text-[9.5px] font-bold uppercase tracking-[0.03em] text-[rgba(32,30,29,0.55)]">
                        Separuh Hari
                      </div>
                      <div className="font-archivo text-sm font-extrabold">RM {f.halfDayRate.toLocaleString("ms-MY")}</div>
                    </div>
                    <div className="flex-1 bg-[#f3f2f2] px-2.5 py-2">
                      <div className="text-[9.5px] font-bold uppercase tracking-[0.03em] text-[rgba(32,30,29,0.55)]">
                        Satu Hari
                      </div>
                      <div className="font-archivo text-sm font-extrabold">RM {(f.fullDayRate ?? f.costPerUse).toLocaleString("ms-MY")}</div>
                    </div>
                  </div>
                ) : null}

                <Link
                  href={canBook ? `/kalendar?facility=${f.id}` : "#"}
                  className={`mt-auto block w-full py-2.5 text-left font-archivo text-[13px] font-extrabold ${
                    canBook
                      ? "bg-[#6d28d9] text-[#f3f2f2] hover:bg-[#4c1d95]"
                      : "pointer-events-none bg-[#eae7e7] text-[#9b9797]"
                  }`}
                >
                  {canBook ? "Tempah Fasiliti" : "Tidak Tersedia"}
                </Link>

                {isStaff && (
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <FacilityStatusSelect facilityId={f.id} status={f.status} />
                    <span className="flex items-center gap-1.5 border border-[rgba(32,30,29,0.4)] px-2.5 py-1.5 text-[12.5px] font-bold text-[#201e1d]">
                      <PencilSimple weight="duotone" size={14} /> Ubah
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-[18px] grid grid-cols-1 gap-px border border-[rgba(32,30,29,0.4)] bg-[rgba(32,30,29,0.3)] md:grid-cols-2">
        <div className="bg-white p-[18px]">
          <div className="mb-3 font-archivo text-sm font-extrabold">Kemudahan Lain</div>
          <div className="flex flex-col gap-2.5 text-[12.5px]">
            <div><strong>Surau Al-Firdaus</strong> — Ruang solat, kapasiti 100 jemaah</div>
            <div><strong>Kemudahan Parking</strong> — 117 lot tersedia</div>
            <div><strong>Kemudahan Riadah</strong> — Ruang aktiviti luar/gelanggang</div>
            <div><strong>Khidmat Katering</strong> — Wajib guna katering berdaftar MPC; tempahan melalui pihak MPC</div>
          </div>
        </div>
        <div className="bg-white p-[18px]">
          <div className="mb-3 font-archivo text-sm font-extrabold">Pakej Makanan (Setiap Pax)</div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="border-b border-[rgba(32,30,29,0.2)] py-1.5 text-left text-[9.5px] uppercase text-[rgba(32,30,29,0.55)]">Pakej</th>
                <th className="border-b border-[rgba(32,30,29,0.2)] py-1.5 text-right text-[9.5px] uppercase text-[rgba(32,30,29,0.55)]">Makan Tengahari/Malam</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border-b border-[rgba(32,30,29,0.1)] py-1.5">Pakej A</td><td className="border-b border-[rgba(32,30,29,0.1)] py-1.5 text-right font-bold">RM 26.00</td></tr>
              <tr><td className="border-b border-[rgba(32,30,29,0.1)] py-1.5">Pakej B</td><td className="border-b border-[rgba(32,30,29,0.1)] py-1.5 text-right font-bold">RM 20.00</td></tr>
              <tr><td className="py-1.5">Pakej C</td><td className="py-1.5 text-right font-bold">RM 15.00</td></tr>
            </tbody>
          </table>
          <div className="mt-2 text-[11px] text-[rgba(32,30,29,0.55)]">
            Termasuk sarapan, minum pagi/petang/malam. Hubungi pihak MPC untuk tempahan katering.
          </div>
        </div>
      </div>
    </div>
  );
}
