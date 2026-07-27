import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Navbar name={session.name} role={session.role} />
      <div className="flex min-h-0 flex-1">
        <Sidebar name={session.name} role={session.role} />
        <main className="min-w-0 flex-1 overflow-y-auto bg-white p-7 text-[#201e1d]">{children}</main>
      </div>
    </div>
  );
}
