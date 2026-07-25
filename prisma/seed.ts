import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

async function main() {
  await prisma.notification.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.facility.deleteMany();
  await prisma.user.deleteMany();

  const [superadmin, admin1, admin2, faiz, dayang, siti, razak] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Nor Azlina Superadmin",
        email: "superadmin@sro-campushub.my",
        username: "superadmin",
        phone: "60123456780",
        passwordHash: await hash("super123"),
        role: "SUPERADMIN",
      },
    }),
    prisma.user.create({
      data: {
        name: "Hafiz Rahman",
        email: "hafiz.admin@sro-campushub.my",
        username: "admin1",
        phone: "60123456781",
        passwordHash: await hash("admin123"),
        role: "ADMIN",
      },
    }),
    prisma.user.create({
      data: {
        name: "Ct Norlina Admin",
        email: "norlina.admin@sro-campushub.my",
        username: "admin2",
        phone: "60123456782",
        passwordHash: await hash("admin123"),
        role: "ADMIN",
      },
    }),
    prisma.user.create({
      data: {
        name: "Ahmad Faiz",
        email: "ahmad.faiz@kampus.edu.my",
        username: "ahmad.faiz",
        phone: "60123456783",
        passwordHash: await hash("pemohon123"),
        role: "PEMOHON",
      },
    }),
    prisma.user.create({
      data: {
        name: "Dayang Salmah",
        email: "dayang.salmah@kampus.edu.my",
        username: "dayang.salmah",
        phone: "60123456784",
        passwordHash: await hash("pemohon123"),
        role: "PEMOHON",
      },
    }),
    prisma.user.create({
      data: {
        name: "Siti Aminah",
        email: "siti.aminah@kampus.edu.my",
        username: "siti.aminah",
        phone: "60123456785",
        passwordHash: await hash("pengadu123"),
        role: "PENGADU",
      },
    }),
    prisma.user.create({
      data: {
        name: "Razak Mahmud",
        email: "razak.mahmud@kampus.edu.my",
        username: "razak.mahmud",
        phone: "60123456786",
        passwordHash: await hash("pengadu123"),
        role: "PENGADU",
      },
    }),
  ]);

  const facilityData = [
    {
      name: "Dewan Produktiviti",
      type: "Dewan",
      capacity: 300,
      description: "Dewan utama untuk majlis rasmi, seminar besar dan konvensyen.",
      costPerUse: 1500,
      status: "TERSEDIA",
    },
    {
      name: "Asrama (Blok A)",
      type: "Asrama",
      capacity: 36,
      description: "36 bilik penginapan pelajar/peserta latihan, dilengkapi 2 katil per bilik.",
      costPerUse: 80,
      status: "TERSEDIA",
    },
    {
      name: "Bilik ICC",
      type: "Bilik Mesyuarat",
      capacity: 40,
      description: "Bilik mesyuarat International Conference Centre untuk taklimat & bengkel.",
      costPerUse: 300,
      status: "TERSEDIA",
    },
    {
      name: "Bilik TQM",
      type: "Bilik Mesyuarat",
      capacity: 30,
      description: "Bilik mesyuarat Total Quality Management, sesuai untuk sesi latihan kecil.",
      costPerUse: 250,
      status: "PENYELENGGARAAN",
    },
    {
      name: "Auditorium",
      type: "Auditorium",
      capacity: 500,
      description: "Auditorium bertingkat untuk persidangan dan majlis konvokesyen.",
      costPerUse: 2000,
      status: "TERSEDIA",
    },
    {
      name: "Dewan Makan Dalam",
      type: "Dewan Makan",
      capacity: 200,
      description: "Ruang makan berhawa dingin di dalam bangunan utama.",
      costPerUse: 400,
      status: "TERSEDIA",
    },
    {
      name: "Dewan Makan Luar",
      type: "Dewan Makan",
      capacity: 150,
      description: "Ruang makan terbuka bertutup (semi-outdoor) berhampiran taman.",
      costPerUse: 300,
      status: "DITEMPAH",
    },
  ];

  const facilities = [];
  for (const f of facilityData) {
    facilities.push(await prisma.facility.create({ data: f }));
  }

  const [dewanProduktiviti, asrama, ibilikICC, bilikTQM, auditorium, dmDalam, dmLuar] = facilities;

  const now = new Date();
  function daysFromNow(days: number, hour = 9) {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(hour, 0, 0, 0);
    return d;
  }

  await prisma.booking.create({
    data: {
      facilityId: dewanProduktiviti.id,
      userId: faiz.id,
      startDateTime: daysFromNow(3, 8),
      endDateTime: daysFromNow(3, 17),
      purpose: "Seminar Produktiviti Wilayah Selatan 2026",
      participantCount: 220,
      arrangement: "THEATER",
      addOnProjector: 2,
      addOnTv100: 1,
      status: "DISAHKAN",
      revenue: 1500,
    },
  });

  await prisma.booking.create({
    data: {
      facilityId: ibilikICC.id,
      userId: faiz.id,
      startDateTime: daysFromNow(5, 9),
      endDateTime: daysFromNow(5, 13),
      purpose: "Bengkel Analisis Data Jabatan",
      participantCount: 25,
      arrangement: "CLASSROOM",
      addOnProjector: 1,
      addOnTv100: 0,
      earlyAccess: true,
      earlyAccessMinutes: 30,
      status: "MENUNGGU",
    },
  });

  await prisma.booking.create({
    data: {
      facilityId: dmDalam.id,
      userId: dayang.id,
      startDateTime: daysFromNow(1, 12),
      endDateTime: daysFromNow(1, 14),
      purpose: "Majlis Makan Malam Delegasi",
      participantCount: 120,
      arrangement: "ROUND_TABLE",
      status: "MENUNGGU",
    },
  });

  await prisma.booking.create({
    data: {
      facilityId: asrama.id,
      userId: dayang.id,
      startDateTime: daysFromNow(7, 14),
      endDateTime: daysFromNow(10, 12),
      purpose: "Penginapan peserta Kursus Kepimpinan",
      participantCount: 30,
      roomNumber: "A-01 hingga A-15",
      status: "DISAHKAN",
      revenue: 1200,
    },
  });

  await prisma.booking.create({
    data: {
      facilityId: auditorium.id,
      userId: faiz.id,
      startDateTime: daysFromNow(-10, 8),
      endDateTime: daysFromNow(-10, 17),
      purpose: "Konvensyen Kualiti Tahunan",
      participantCount: 400,
      arrangement: "THEATER",
      status: "DISAHKAN",
      revenue: 2000,
    },
  });

  await prisma.booking.create({
    data: {
      facilityId: bilikTQM.id,
      userId: dayang.id,
      startDateTime: daysFromNow(2, 9),
      endDateTime: daysFromNow(2, 12),
      purpose: "Mesyuarat Jawatankuasa TQM",
      participantCount: 15,
      arrangement: "SEMINAR",
      status: "DITOLAK",
      rejectionReason: "Bilik dalam penyelenggaraan sehingga notis selanjutnya.",
    },
  });

  await prisma.complaint.create({
    data: {
      facilityId: bilikTQM.id,
      userId: siti.id,
      location: "Bilik TQM - Penghawa Dingin",
      description: "Penghawa dingin tidak berfungsi, bilik terlalu panas untuk sesi mesyuarat.",
      status: "DALAM_TINDAKAN",
      repairType: "KONTRAKTOR",
    },
  });

  await prisma.complaint.create({
    data: {
      facilityId: asrama.id,
      userId: siti.id,
      location: "Asrama Blok A - Bilik A-12",
      description: "Paip air tandas bocor sejak semalam.",
      status: "SELESAI",
      repairType: "DALAMAN",
      createdAt: daysFromNow(-4),
      resolvedAt: daysFromNow(-1),
    },
  });

  await prisma.complaint.create({
    data: {
      facilityId: dewanProduktiviti.id,
      userId: razak.id,
      location: "Dewan Produktiviti - Sistem PA",
      description: "Mikrofon wayarles berdesing semasa majlis, perlu semakan segera.",
      status: "BARU",
    },
  });

  await prisma.complaint.create({
    data: {
      facilityId: dmLuar.id,
      userId: razak.id,
      location: "Dewan Makan Luar - Bumbung",
      description: "Kebocoran air hujan pada bumbung bahagian sudut kanan.",
      status: "DALAM_TINDAKAN",
      repairType: "KONTRAKTOR",
    },
  });

  console.log("Seed selesai:");
  console.log({ superadmin: superadmin.username, admin1: admin1.username, admin2: admin2.username });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
