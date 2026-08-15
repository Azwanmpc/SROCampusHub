import Link from "next/link";
import { Buildings, Check, LockKey, Warning, WarningCircle } from "@phosphor-icons/react";

const TEMPAHAN_FEATURES = ["Semak kemudahan", "Semak ketersediaan", "Tempahan dalam talian"];
const ADUAN_FEATURES = ["Nyatakan lokasi", "Terangkan kerosakan", "Lampirkan gambar"];

export default function PublicServices() {
  return (
    <section id="perkhidmatan" className="bg-[var(--landing-bg)] px-5 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-10 sm:mb-14">
          <div className="mb-2 text-[13px] font-bold uppercase tracking-[0.1em] text-[#ed1b26]">Perkhidmatan</div>
          <h2 className="font-archivo text-[30px] font-extrabold text-[var(--landing-ink)] sm:text-[38px]">
            Perkhidmatan Untuk Anda
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Card 1: Tempahan Fasiliti */}
          <div className="flex flex-col border border-[var(--landing-border)] bg-[var(--landing-surface)] p-7 sm:p-9">
            <div className="mb-5 flex items-center justify-between">
              <Buildings weight="duotone" size={34} className="text-[#ed1b26]" />
              <span className="flex items-center gap-1.5 border border-[#f5c76b] bg-[#fff8e6] px-2.5 py-1 text-[11px] font-bold text-[#8a6d1f]">
                <LockKey weight="bold" size={12} /> Akaun diperlukan
              </span>
            </div>
            <h3 className="font-archivo text-[21px] font-extrabold text-[var(--landing-ink)]">Tempahan Fasiliti</h3>
            <p className="mt-2.5 text-[14.5px] leading-[1.6] text-[var(--landing-slate)]">
              Tempah dewan, bilik mesyuarat, auditorium, ruang latihan dan kemudahan MPC Wilayah Selatan.
            </p>
            <ul className="mt-5 flex flex-col gap-2">
              {TEMPAHAN_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[13.5px] text-[var(--landing-ink)]">
                  <Check weight="bold" size={14} className="flex-none text-[#ed1b26]" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/register?role=PEMOHON"
                className="bg-[#ed1b26] px-5 py-3 font-archivo text-[13.5px] font-extrabold text-white transition-colors hover:bg-[#c4141e]"
              >
                Daftar &amp; Tempah
              </Link>
              <Link
                href="/login?redirect=/kalendar"
                className="border border-[var(--landing-border)] px-5 py-3 font-archivo text-[13.5px] font-extrabold text-[var(--landing-ink)] transition-colors hover:bg-[var(--landing-bg)]"
              >
                Sudah ada akaun?
              </Link>
            </div>
          </div>

          {/* Card 2: Aduan Kerosakan */}
          <div className="flex flex-col border border-[var(--landing-border)] bg-[var(--landing-surface)] p-7 sm:p-9">
            <div className="mb-5 flex items-center justify-between">
              <WarningCircle weight="duotone" size={34} className="text-[#ed1b26]" />
              <span className="flex items-center gap-1.5 border border-[#8fd4a8] bg-[#e9faf0] px-2.5 py-1 text-[11px] font-bold text-[#1b7a44]">
                <Check weight="bold" size={12} /> Tiada pendaftaran diperlukan
              </span>
            </div>
            <h3 className="font-archivo text-[21px] font-extrabold text-[var(--landing-ink)]">Aduan Kerosakan</h3>
            <p className="mt-2.5 text-[14.5px] leading-[1.6] text-[var(--landing-slate)]">
              Laporkan kerosakan fasiliti dengan cepat kepada pasukan penyelenggaraan.
            </p>
            <ul className="mt-5 flex flex-col gap-2">
              {ADUAN_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[13.5px] text-[var(--landing-ink)]">
                  <Check weight="bold" size={14} className="flex-none text-[#ed1b26]" />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-7">
              <Link
                href="/aduan-awam"
                className="inline-block bg-[#ed1b26] px-5 py-3 font-archivo text-[13.5px] font-extrabold text-white transition-colors hover:bg-[#c4141e]"
              >
                Buat Aduan
              </Link>
            </div>
          </div>
        </div>
        <p className="mt-5 flex items-center gap-1.5 text-[12.5px] text-[var(--landing-slate)]">
          <Warning size={13} className="flex-none" /> Warga MPC juga boleh membuat aduan tanpa log masuk.
        </p>
      </div>
    </section>
  );
}
