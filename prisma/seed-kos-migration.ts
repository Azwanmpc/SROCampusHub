import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Old Complaint.category -> new KosPenyelenggaraan.kategori
const CATEGORY_MAP: Record<string, string> = {
  ELEKTRIK: "ELEKTRIK",
  PLUMBING: "AIR_PLUMBING",
  HVAC: "PENGHAWA_DINGIN",
  STRUKTUR: "BANGUNAN_STRUKTUR",
  LANDSKAP: "LAIN_LAIN",
  LAIN: "LAIN_LAIN",
};

async function main() {
  const complaints = await prisma.complaint.findMany({
    where: { repairType: { not: null }, estimatedCost: { gt: 0 } },
  });

  console.log(`Found ${complaints.length} complaint(s) with recorded repair cost to migrate.`);

  let created = 0;
  for (const c of complaints) {
    await prisma.kosPenyelenggaraan.create({
      data: {
        tarikh: c.resolvedAt ?? c.createdAt,
        lokasi: "LAIN_LAIN",
        perincianLokasi: c.location,
        jenis: "PEMBAIKAN",
        butiranKerja: c.staffNote ? `${c.description} — ${c.staffNote}` : c.description,
        kos: c.estimatedCost,
        tugasDilaksanakan: c.repairType as string,
        kategori: (c.category && CATEGORY_MAP[c.category]) || "LAIN_LAIN",
      },
    });
    created++;
  }

  console.log(`Migrated ${created} record(s) into KosPenyelenggaraan.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
