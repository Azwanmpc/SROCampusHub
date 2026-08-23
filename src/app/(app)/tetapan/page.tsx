import { prisma } from "@/lib/prisma";
import UserManagement from "@/components/UserManagement";

export default async function TetapanPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      phone: true,
      jawatan: true,
      role: true,
      active: true,
    },
  });

  return (
    <div>
      <div className="mb-0.5 font-archivo text-[26px] font-extrabold">Tetapan / Urus Pengguna</div>
      <div className="mb-3.5 text-[13.5px] text-[rgba(var(--ink-rgb),0.6)]">Urus akaun &amp; peranan pengguna sistem</div>
      <div className="mb-[18px] h-0.5 bg-[rgba(var(--ink-rgb),0.4)]" />
      <UserManagement users={users} />
    </div>
  );
}
