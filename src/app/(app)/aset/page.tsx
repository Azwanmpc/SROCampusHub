import { Wrench } from "@phosphor-icons/react/dist/ssr";

export default function AsetPage() {
  return (
    <div>
      <div className="mb-0.5 font-archivo text-[26px] font-extrabold">Dashboard Aset</div>
      <div className="mb-3.5 text-[13.5px] text-[rgba(32,30,29,0.6)]">
        Daftar aset, lokasi dan status penyelenggaraan berkala
      </div>
      <div className="mb-[18px] h-0.5 bg-[rgba(32,30,29,0.4)]" />

      <div className="flex flex-col items-center justify-center gap-3 border border-[rgba(32,30,29,0.4)] bg-white px-6 py-16 text-center">
        <Wrench weight="duotone" size={40} className="text-[rgba(32,30,29,0.35)]" />
        <div className="font-archivo text-lg font-extrabold">Akan Datang</div>
        <div className="max-w-[380px] text-sm text-[rgba(32,30,29,0.6)]">
          Modul Dashboard Aset sedang dalam pembangunan dan akan tersedia tidak lama lagi.
        </div>
      </div>
    </div>
  );
}
