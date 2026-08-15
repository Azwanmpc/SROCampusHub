import Link from "next/link";

const PILLARS = ["Reformasi Peraturan", "Teknologi & AI", "Pembangunan Bakat", "Perkhidmatan Fasiliti"];

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-[620px] items-end overflow-hidden sm:min-h-[720px]">
      <img
        src="/images/landing/hero-kampus.webp"
        alt="Bangunan utama MPC Wilayah Selatan dikelilingi pokok palma"
        className="absolute inset-0 h-full w-full object-cover object-[76%_50%]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(15,15,17,0.94)] via-[rgba(15,15,17,0.6)] to-[rgba(15,15,17,0.3)]" />

      <div className="relative mx-auto w-full max-w-[1240px] px-5 pb-14 pt-32 sm:px-8 sm:pb-20">
        <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.12em] text-[rgba(255,255,255,0.75)]">
          MPC Wilayah Selatan
        </div>
        <h1 className="max-w-[720px] font-archivo text-[42px] font-extrabold leading-[1.08] text-white sm:text-[56px] lg:text-[64px]">
          CampusHub
        </h1>
        <p className="mt-4 max-w-[600px] font-archivo text-[18px] font-bold leading-[1.4] text-white sm:text-[22px]">
          Hab Produktiviti, Perkhidmatan dan Transformasi Wilayah Selatan
        </p>
        <p className="mt-3 max-w-[560px] text-[15px] leading-[1.6] text-[rgba(255,255,255,0.8)] sm:text-[16.5px]">
          Menghubungkan inisiatif produktiviti melalui reformasi peraturan, adaptasi teknologi, pembangunan bakat
          serta perkhidmatan MPC dalam satu ekosistem.
        </p>

        <div className="mt-5 grid max-w-[420px] grid-cols-2 gap-x-6 gap-y-2">
          {PILLARS.map((pillar) => (
            <div key={pillar} className="flex items-center gap-2">
              <span className="h-[3px] w-[3px] flex-none bg-[rgba(255,255,255,0.4)]" />
              <span className="text-[11.5px] font-bold uppercase leading-[1.3] tracking-[0.06em] text-[rgba(255,255,255,0.65)]">
                {pillar}
              </span>
            </div>
          ))}
        </div>

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
