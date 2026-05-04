import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SessionProvider } from "next-auth/react";
import { UserMenu } from "@/components/shared/UserMenu";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/");

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <Link href="/teacher/dashboard" className="text-xl font-bold text-primary">MIMS Teacher</Link>
          <UserMenu user={{ name: session.user.name }} />
        </nav>
        <main className="p-6">{children}</main>
      </div>
    </SessionProvider>
  );
}
