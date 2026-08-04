import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ComplaintForm from "@/components/ComplaintForm";

export default async function AduanAwamPage() {
  const facilities = await prisma.facility.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="min-h-screen bg-[#f3f2f2]">
      <div className="flex h-16 items-center justify-between border-b-2 border-[rgba(32,30,29,0.4)] bg-white px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 flex-none items-center justify-center bg-[#e0342a] font-archivo text-xs font-extrabold text-white">
            SRO
          </div>
          <div className="font-archivo text-[17px] font-extrabold leading-none tracking-[-0.01em]">CampusHub</div>
        </Link>
        <Link href="/" className="text-[13px] font-bold text-[#6d28d9] hover:underline">
          Kembali ke Laman Utama
        </Link>
      </div>

      <div className="mx-auto max-w-[560px] px-4 py-10">
        <div className="mb-2 font-archivo text-[24px] font-extrabold">Borang Aduan Kerosakan</div>
        <div className="mb-6 text-[13.5px] text-[rgba(32,30,29,0.6)]">
          Laporkan kerosakan fasiliti kampus. Tiada log masuk diperlukan.
        </div>
        <div className="border border-[rgba(32,30,29,0.4)] bg-white p-6">
          <ComplaintForm facilities={facilities} guest />
        </div>
      </div>
    </div>
  );
}
