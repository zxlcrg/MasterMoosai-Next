import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layouts/AdminSidebar";
import { AdminTopbar } from "@/components/layouts/AdminTopbar";
import { SessionProvider } from "next-auth/react";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar user={{ name: session.user.name, role: session.user.role }} />
        <div className="lg:ml-64 min-h-screen flex flex-col content-transition">
          <AdminTopbar user={{ name: session.user.name }} />
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
