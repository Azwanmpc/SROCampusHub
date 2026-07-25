import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Removes demo transactional data (bookings, complaints, notifications) while
 * keeping user accounts and the facility list intact, so the system is ready
 * for real data entry without losing configured accounts.
 */
async function main() {
  const notifications = await prisma.notification.deleteMany();
  const bookings = await prisma.booking.deleteMany();
  const complaints = await prisma.complaint.deleteMany();

  await prisma.facility.updateMany({
    where: { status: "DITEMPAH" },
    data: { status: "TERSEDIA" },
  });

  console.log("Data demo dibersihkan:");
  console.log({
    notifikasi: notifications.count,
    tempahan: bookings.count,
    aduan: complaints.count,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
