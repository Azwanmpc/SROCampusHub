const STATS = [
  { value: "400", label: "Kapasiti maksimum Dewan Produktiviti" },
  { value: "38", label: "Bilik asrama standard" },
  { value: "117", label: "Lot parking" },
  { value: "100", label: "Kapasiti jemaah Surau Al-Firdaus" },
];

export default function CampusStats() {
  return (
    <section id="mengenai-sro" className="bg-[var(--landing-bg)] px-5 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-[1240px]">
        <div className="mx-auto mb-10 max-w-[640px] text-center sm:mb-14">
          <div className="mb-2 text-[13px] font-bold uppercase tracking-[0.1em] text-[#ed1b26]">Mengenai SRO</div>
          <h2 className="font-archivo text-[26px] font-extrabold text-[var(--landing-ink)] sm:text-[32px]">
            Campus at a Glance
          </h2>
          <p className="mt-3 text-[14.5px] leading-[1.6] text-[var(--landing-slate)]">
            SRO Wilayah Selatan ialah kompleks kemudahan MPC di Bandar Baru UDA, Johor Bahru — menyediakan dewan,
            bilik mesyuarat, penginapan dan ruang latihan untuk agensi kerajaan, syarikat dan orang awam.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden border border-[var(--landing-border)] bg-[var(--landing-border)] lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-[var(--landing-surface)] px-5 py-8 text-center sm:py-10">
              <div className="font-archivo text-[38px] font-extrabold text-[var(--landing-ink)] sm:text-[46px]">{s.value}</div>
              <div className="mt-1.5 text-[12.5px] leading-[1.4] text-[var(--landing-slate)]">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
