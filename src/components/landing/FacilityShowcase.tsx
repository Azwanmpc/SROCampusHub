import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react";

const FACILITIES = [
  { name: "Dewan Produktiviti", capacity: "Sehingga 400 pax", image: "/images/landing/facility-dewan-produktiviti.webp" },
  { name: "Bilik MADANI", capacity: "30 pax", image: "/images/landing/facility-bilik-madani.webp" },
  { name: "Auditorium", capacity: "40 pax", image: "/images/landing/facility-auditorium.webp" },
  { name: "Bilik ICC & TQM", capacity: "Pelbagai konfigurasi", image: "/images/landing/facility-icc-tqm.webp" },
  { name: "Asrama", capacity: "38 bilik standard", image: "/images/landing/facility-asrama.webp" },
];

const OTHER_AMENITIES = [
  { name: "Surau Al-Firdaus", note: "100 jemaah", image: "/images/landing/amenity-surau.webp" },
  { name: "Gelanggang Sukan", note: "Bola tampar & lain-lain", image: "/images/landing/amenity-gelanggang.webp" },
  { name: "Kawasan Parking", note: "117 lot", image: "/images/landing/amenity-parking.webp" },
];

export default function FacilityShowcase() {
  return (
    <section id="kemudahan" className="border-t border-[var(--landing-border)] bg-[var(--landing-surface)] px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4 sm:mb-14">
          <div>
            <div className="mb-2 text-[13px] font-bold uppercase tracking-[0.1em] text-[#ed1b26]">Kemudahan</div>
            <h2 className="font-archivo text-[30px] font-extrabold text-[var(--landing-ink)] sm:text-[38px]">
              Terokai Kemudahan MPC SRO
            </h2>
          </div>
          <Link
            href="/fasiliti"
            className="flex items-center gap-1.5 text-[13.5px] font-bold text-[var(--landing-ink)] hover:text-[#ed1b26]"
          >
            Lihat Semua Kemudahan <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FACILITIES.map((f) => (
            <div key={f.name} className="group border border-[var(--landing-border)] bg-[var(--landing-bg)]">
              <div className="aspect-video overflow-hidden">
                <img
                  src={f.image}
                  alt={f.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <div className="font-archivo text-[15.5px] font-extrabold text-[var(--landing-ink)]">{f.name}</div>
                <div className="mt-0.5 text-[12.5px] text-[var(--landing-slate)]">{f.capacity}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-[var(--landing-border)] pt-8 sm:mt-14">
          <div className="mb-5 text-[13px] font-bold uppercase tracking-[0.08em] text-[var(--landing-slate)]">
            Kemudahan Lain
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {OTHER_AMENITIES.map((a) => (
              <div key={a.name} className="flex items-center gap-3 border border-[var(--landing-border)] p-3">
                <img src={a.image} alt={a.name} className="h-14 w-20 flex-none object-cover" />
                <div>
                  <div className="text-[13.5px] font-bold text-[var(--landing-ink)]">{a.name}</div>
                  <div className="text-[12px] text-[var(--landing-slate)]">{a.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
