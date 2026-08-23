import HasilSewaanKemaskini from "@/components/HasilSewaanKemaskini";

export default function HasilSewaanKemaskiniPage() {
  return (
    <div>
      <div className="mb-0.5 font-archivo text-[26px] font-extrabold">Kemaskini Data Hasil Sewaan</div>
      <div className="mb-3.5 text-[13.5px] text-[rgba(var(--ink-rgb),0.6)]">Masukkan atau kemaskini rekod hasil sewaan bulanan secara manual</div>
      <div className="mb-4 h-0.5 bg-[rgba(var(--ink-rgb),0.4)]" />
      <HasilSewaanKemaskini />
    </div>
  );
}
