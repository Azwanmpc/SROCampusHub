import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar name={session.name} role={session.role} />
      <main className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">{children}</main>
    </div>
  );
}
