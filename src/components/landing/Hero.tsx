import Link from "next/link";

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-[560px] items-end overflow-hidden sm:min-h-[640px]">
      <img
        src="/images/landing/hero-kampus.webp"
        alt="Bangunan utama MPC Wilayah Selatan dikelilingi pokok palma"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,15,17,0.92)] via-[rgba(15,15,17,0.55)] to-[rgba(15,15,17,0.25)]" />

      <div className="relative mx-auto w-full max-w-[1240px] px-5 pb-14 pt-32 sm:px-8 sm:pb-20">
        <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.12em] text-[rgba(255,255,255,0.75)]">
          MPC Wilayah Selatan
        </div>
        <h1 className="max-w-[720px] font-archivo text-[42px] font-extrabold leading-[1.08] text-white sm:text-[56px] lg:text-[64px]">
          CampusHub
        </h1>
        <p className="mt-4 max-w-[520px] text-[16px] leading-[1.55] text-[rgba(255,255,255,0.88)] sm:text-[18px]">
          Gerbang digital kemudahan dan perkhidmatan MPC Wilayah Selatan.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#perkhidmatan"
            className="bg-[#ed1b26] px-6 py-3.5 font-archivo text-[14px] font-extrabold text-white transition-colors hover:bg-[#c4141e]"
          >
            Tempah Fasiliti
          </a>
          <a
            href="#perkhidmatan"
            className="border border-white/70 bg-white/5 px-6 py-3.5 font-archivo text-[14px] font-extrabold text-white backdrop-blur transition-colors hover:bg-white/15"
          >
            Lapor Kerosakan
          </a>
        </div>

        <Link
          href="/login"
          className="mt-6 inline-block text-[13.5px] font-semibold text-white/80 underline decoration-white/40 underline-offset-4 hover:text-white"
        >
          Warga MPC? Akses Portal Staf →
        </Link>
      </div>
    </section>
  );
}
