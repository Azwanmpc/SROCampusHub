import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const RAW: Record<string, Record<string, { total_hasil: number; total_peserta: number; total_bilangan: number; by_lokasi: Record<string, { hasil: number; peserta: number; bilangan: number }> }>> = {
  "2025": {
    "Januari": { total_hasil: 31320.0, total_peserta: 3140.0, total_bilangan: 16, by_lokasi: { "ICC": { hasil: 4200.0, peserta: 360.0, bilangan: 3 }, "DEWAN PRODUKTIVITI": { hasil: 24480.0, peserta: 2500.0, bilangan: 8 }, "ASRAMA": { hasil: 940.0, peserta: 30.0, bilangan: 3 }, "DEWAN MAKAN": { hasil: 1700.0, peserta: 250.0, bilangan: 2 } } },
    "Februari": { total_hasil: 13200.0, total_peserta: 1440.0, total_bilangan: 9, by_lokasi: { "DEWAN MAKAN": { hasil: 500.0, peserta: 550.0, bilangan: 2 }, "ICC": { hasil: 2400.0, peserta: 140.0, bilangan: 3 }, "DEWAN PRODUKTIVITI": { hasil: 10300.0, peserta: 750.0, bilangan: 4 } } },
    "Mac": { total_hasil: 7688.0, total_peserta: 560.0, total_bilangan: 4, by_lokasi: { "DEWAN PRODUKTIVITI": { hasil: 5800.0, peserta: 400.0, bilangan: 2 }, "ICC": { hasil: 1888.0, peserta: 160.0, bilangan: 2 } } },
    "April": { total_hasil: 6580.0, total_peserta: 530.0, total_bilangan: 4, by_lokasi: { "DEWAN PRODUKTIVITI": { hasil: 5900.0, peserta: 400.0, bilangan: 2 }, "ICC": { hasil: 500.0, peserta: 65.0, bilangan: 1 }, "DEWAN MAKAN": { hasil: 180.0, peserta: 65.0, bilangan: 1 } } },
    "Mei": { total_hasil: 22280.0, total_peserta: 2120.0, total_bilangan: 16, by_lokasi: { "DEWAN PRODUKTIVITI": { hasil: 13780.0, peserta: 1150.0, bilangan: 6 }, "ICC": { hasil: 7600.0, peserta: 670.0, bilangan: 7 }, "DEWAN MAKAN": { hasil: 900.0, peserta: 300.0, bilangan: 3 } } },
    "Jun": { total_hasil: 12090.0, total_peserta: 2274.0, total_bilangan: 10, by_lokasi: { "DEWAN PRODUKTIVITI": { hasil: 10600.0, peserta: 1400.0, bilangan: 5 }, "ASRAMA": { hasil: 140.0, peserta: 4.0, bilangan: 1 }, "DEWAN MAKAN": { hasil: 450.0, peserta: 650.0, bilangan: 2 }, "ICC": { hasil: 900.0, peserta: 220.0, bilangan: 2 } } },
    "Julai": { total_hasil: 64955.0, total_peserta: 3599.0, total_bilangan: 23, by_lokasi: { "TQM": { hasil: 3520.0, peserta: 255.0, bilangan: 3 }, "ICC": { hasil: 7750.0, peserta: 525.0, bilangan: 7 }, "DEWAN MAKAN": { hasil: 1430.0, peserta: 710.0, bilangan: 4 }, "ASRAMA": { hasil: 4095.0, peserta: 109.0, bilangan: 4 }, "DEWAN PRODUKTIVITI": { hasil: 48160.0, peserta: 2000.0, bilangan: 5 } } },
    "Ogos": { total_hasil: 18330.0, total_peserta: 1634.0, total_bilangan: 18, by_lokasi: { "ICC": { hasil: 3980.0, peserta: 430.0, bilangan: 4 }, "DEWAN PRODUKTIVITI": { hasil: 6780.0, peserta: 870.0, bilangan: 3 }, "ASRAMA": { hasil: 6600.0, peserta: 104.0, bilangan: 9 }, "DEWAN MAKAN": { hasil: 970.0, peserta: 230.0, bilangan: 2 } } },
    "September": { total_hasil: 21530.0, total_peserta: 926.0, total_bilangan: 11, by_lokasi: { "DEWAN PRODUKTIVITI": { hasil: 9900.0, peserta: 700.0, bilangan: 4 }, "ASRAMA": { hasil: 9430.0, peserta: 136.0, bilangan: 5 }, "ICC": { hasil: 2200.0, peserta: 90.0, bilangan: 2 } } },
    "Oktober": { total_hasil: 29450.0, total_peserta: 1032.0, total_bilangan: 11, by_lokasi: { "DEWAN PRODUKTIVITI": { hasil: 8480.0, peserta: 480.0, bilangan: 3 }, "ASRAMA": { hasil: 16130.0, peserta: 212.0, bilangan: 4 }, "ICC": { hasil: 3400.0, peserta: 160.0, bilangan: 2 }, "TQM": { hasil: 720.0, peserta: 100.0, bilangan: 1 }, "DEWAN MAKAN": { hasil: 720.0, peserta: 80.0, bilangan: 1 } } },
    "November": { total_hasil: 30210.0, total_peserta: 3265.0, total_bilangan: 16, by_lokasi: { "DEWAN PRODUKTIVITI": { hasil: 21280.0, peserta: 1700.0, bilangan: 6 }, "DEWAN MAKAN": { hasil: 1700.0, peserta: 950.0, bilangan: 3 }, "ICC": { hasil: 4200.0, peserta: 490.0, bilangan: 2 }, "ASRAMA": { hasil: 3030.0, peserta: 125.0, bilangan: 5 } } },
    "Disember": { total_hasil: 22120.0, total_peserta: 2964.0, total_bilangan: 31, by_lokasi: { "DEWAN PRODUKTIVITI": { hasil: 17630.0, peserta: 2300.0, bilangan: 9 }, "DEWAN MAKAN": { hasil: 500.0, peserta: 600.0, bilangan: 2 }, "ASRAMA": { hasil: 3990.0, peserta: 64.0, bilangan: 20 } } },
  },
  "2026": {
    "Januari": { total_hasil: 24550.0, total_peserta: 2446.0, total_bilangan: 18, by_lokasi: { "DEWAN PRODUKTIVITI": { hasil: 16260.0, peserta: 1450.0, bilangan: 5 }, "DEWAN MAKAN": { hasil: 250.0, peserta: 500.0, bilangan: 1 }, "ASRAMA": { hasil: 3470.0, peserta: 71.0, bilangan: 5 }, "ICC": { hasil: 4570.0, peserta: 425.0, bilangan: 7 } } },
    "Februari": { total_hasil: 10104.0, total_peserta: 610.0, total_bilangan: 9, by_lokasi: { "ASRAMA": { hasil: 140.0, peserta: 4.0, bilangan: 2 }, "DEWAN PRODUKTIVITI": { hasil: 7600.0, peserta: 436.0, bilangan: 3 }, "ICC": { hasil: 2264.0, peserta: 130.0, bilangan: 3 }, "DEWAN MAKAN": { hasil: 100.0, peserta: 40.0, bilangan: 1 } } },
    "Mac": { total_hasil: 8270.0, total_peserta: 339.0, total_bilangan: 4, by_lokasi: { "DEWAN PRODUKTIVITI": { hasil: 2900.0, peserta: 200.0, bilangan: 1 }, "ICC": { hasil: 5020.0, peserta: 135.0, bilangan: 2 }, "ASRAMA": { hasil: 350.0, peserta: 4.0, bilangan: 1 } } },
    "April": { total_hasil: 39935.0, total_peserta: 1623.0, total_bilangan: 29, by_lokasi: { "ASRAMA": { hasil: 21296.0, peserta: 413.0, bilangan: 19 }, "DEWAN PRODUKTIVITI": { hasil: 11500.0, peserta: 900.0, bilangan: 4 }, "TQM": { hasil: 500.0, peserta: 50.0, bilangan: 1 }, "ICC": { hasil: 6639.0, peserta: 260.0, bilangan: 5 } } },
    "Mei": { total_hasil: 22028.0, total_peserta: 1784.0, total_bilangan: 13, by_lokasi: { "ASRAMA": { hasil: 4508.0, peserta: 84.0, bilangan: 2 }, "DEWAN PRODUKTIVITI": { hasil: 14580.0, peserta: 1150.0, bilangan: 6 }, "DEWAN MAKAN": { hasil: 250.0, peserta: 200.0, bilangan: 1 }, "ICC": { hasil: 2690.0, peserta: 350.0, bilangan: 4 } } },
    "Jun": { total_hasil: 18700.0, total_peserta: 880.0, total_bilangan: 8, by_lokasi: { "DEWAN PRODUKTIVITI": { hasil: 8700.0, peserta: 600.0, bilangan: 3 }, "MADANI": { hasil: 2040.0, peserta: 20.0, bilangan: 1 }, "ICC": { hasil: 4460.0, peserta: 210.0, bilangan: 3 }, "ASRAMA": { hasil: 3500.0, peserta: 50.0, bilangan: 1 } } },
    "Julai": { total_hasil: 66040.0, total_peserta: 3247.0, total_bilangan: 19, by_lokasi: { "DEWAN PRODUKTIVITI": { hasil: 46080.0, peserta: 2410.0, bilangan: 6 }, "ASRAMA": { hasil: 11150.0, peserta: 237.0, bilangan: 7 }, "ICC": { hasil: 7160.0, peserta: 250.0, bilangan: 3 }, "DEWAN MAKAN": { hasil: 1650.0, peserta: 350.0, bilangan: 3 } } },
  },
};

const MONTH_ORDER = ["Januari", "Februari", "Mac", "April", "Mei", "Jun", "Julai", "Ogos", "September", "Oktober", "November", "Disember"];

async function main() {
  await prisma.hasilSewaan.deleteMany({ where: { organisasi: "Rekod Sejarah (Import Data Sedia Ada)" } });

  let count = 0;
  for (const year of Object.keys(RAW)) {
    for (const month of Object.keys(RAW[year])) {
      const mo = RAW[year][month];
      const monthIndex = MONTH_ORDER.indexOf(month);
      for (const jenis of Object.keys(mo.by_lokasi)) {
        const lk = mo.by_lokasi[jenis];
        const n = Math.max(1, lk.bilangan);
        for (let i = 0; i < n; i++) {
          await prisma.hasilSewaan.create({
            data: {
              tarikh: new Date(Number(year), monthIndex, 1),
              organisasi: "Rekod Sejarah (Import Data Sedia Ada)",
              lokasi: jenis,
              bilanganPeserta: lk.peserta / n,
              hasilTerimaan: lk.hasil / n,
            },
          });
          count++;
        }
      }
    }
  }
  console.log(`Seed Hasil Sewaan selesai: ${count} rekod.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
