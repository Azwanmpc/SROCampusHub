import Link from "next/link";
import { EnvelopeSimple, GlobeSimple, MapPin, Phone, Printer } from "@phosphor-icons/react";

export default function LandingFooter() {
  return (
    <footer className="border-t border-[var(--landing-border)] bg-[var(--landing-surface)] px-5 py-14 sm:px-8">
      <div className="mx-auto max-w-[1240px]">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <div className="font-archivo text-[16px] font-extrabold text-[var(--landing-ink)]">
              <span className="text-[#ed1b26]">MPC</span> CampusHub
            </div>
            <p className="mt-3 max-w-[280px] text-[13px] leading-[1.6] text-[var(--landing-slate)]">
              Perbadanan Produktiviti Malaysia (MPC) Wilayah Selatan — tempahan fasiliti, aduan penyelenggaraan dan
              pengurusan kampus dalam satu sistem.
            </p>
          </div>

          <div>
            <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--landing-slate)]">
              Pautan Pantas
            </div>
            <ul className="flex flex-col gap-2 text-[13.5px] text-[var(--landing-ink)]">
              <li>
                <a href="#kemudahan" className="hover:text-[#ed1b26]">Kemudahan</a>
              </li>
              <li>
                <a href="#perkhidmatan" className="hover:text-[#ed1b26]">Perkhidmatan</a>
              </li>
              <li>
                <Link href="/rkb" className="hover:text-[#ed1b26]">Inisiatif &amp; Program (RKB)</Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#ed1b26]">Log Masuk Warga MPC</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-3 text-[12px] font-bold uppercase tracking-[0.08em] text-[var(--landing-slate)]">
              Hubungi Kami
            </div>
            <ul className="flex flex-col gap-2.5 text-[13.5px] text-[var(--landing-ink)]">
              <li className="flex items-start gap-2">
                <MapPin size={16} className="mt-0.5 flex-none text-[var(--landing-slate)]" />
                <span>
                  Perbadanan Produktiviti Malaysia (MPC) Wilayah Selatan
                  <br />
                  No. 8, Jalan Padi Mahsuri, Bandar Baru UDA,
                  <br />
                  81200 Johor Bahru, Johor
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="flex-none text-[var(--landing-slate)]" /> 07-2377422
              </li>
              <li className="flex items-center gap-2">
                <Printer size={16} className="flex-none text-[var(--landing-slate)]" /> 07-2380798
              </li>
              <li className="flex items-center gap-2">
                <EnvelopeSimple size={16} className="flex-none text-[var(--landing-slate)]" /> sro@mpc.gov.my
              </li>
              <li className="flex items-center gap-2">
                <GlobeSimple size={16} className="flex-none text-[var(--landing-slate)]" />
                <a href="https://www.mpc.gov.my" target="_blank" rel="noopener noreferrer" className="hover:text-[#ed1b26]">
                  www.mpc.gov.my
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--landing-border)] pt-6 text-[12px] text-[var(--landing-slate)]">
          © {new Date().getFullYear()} Perbadanan Produktiviti Malaysia (MPC) Wilayah Selatan. Hak cipta terpelihara.
        </div>
      </div>
    </footer>
  );
}
