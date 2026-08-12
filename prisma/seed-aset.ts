import { PrismaClient } from "@prisma/client";
import data from "./aset-data.json";

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.aset.count();
  if (count > 0) {
    console.log(`Aset sudah ada ${count} rekod — langkau seeding untuk elak pertindihan.`);
    return;
  }

  await prisma.aset.createMany({
    data: data as { namaAset: string; noPendaftaran: string; tahun: string; lokasi: string; status: string }[],
  });

  console.log(`Seed Aset selesai: ${data.length} rekod.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
