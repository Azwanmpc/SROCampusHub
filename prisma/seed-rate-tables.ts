import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const rooms = [
    { key: "EKSEKUTIF", label: "Suit Eksekutif", rate: 150, bilikTersedia: 1 },
    { key: "BIASA", label: "Bilik Biasa", rate: 70, bilikTersedia: 38 },
    { key: "DORM", label: "Bilik Dorm", rate: 150, bilikTersedia: 1 },
  ];
  for (const r of rooms) {
    await prisma.asramaRoomType.upsert({ where: { key: r.key }, update: {}, create: r });
  }
  const addons = [
    { key: "tv-lcd", label: 'SMART LED TV 100"', appliesTo: JSON.stringify(["Bilik ICC", "Bilik TQM"]), half: 100, full: 200 },
    { key: "led-skrin", label: "LED Skrin", appliesTo: JSON.stringify(["Dewan Produktiviti"]), half: 400, full: 700 },
    { key: "lcd-projektor", label: "LCD Projektor", appliesTo: JSON.stringify(["Dewan Produktiviti", "Bilik ICC", "Bilik TQM"]), half: 200, full: 300 },
  ];
  for (const a of addons) {
    await prisma.equipmentAddon.upsert({ where: { key: a.key }, update: {}, create: a });
  }
  console.log("seeded");
}
main().finally(() => prisma.$disconnect());
