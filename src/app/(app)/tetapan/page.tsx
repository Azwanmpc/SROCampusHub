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
      role: true,
      active: true,
    },
  });

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold text-slate-800">Tetapan & Urus Pengguna</h1>
      <p className="mb-6 text-sm text-slate-500">Urus akaun pengguna dan peranan sistem.</p>
      <UserManagement users={users} />
    </div>
  );
}
