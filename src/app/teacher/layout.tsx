import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "TEACHER") redirect("/");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/teacher/dashboard" className="text-xl font-bold text-primary">MIMS Teacher</Link>
        <div className="text-sm text-gray-700">{session.user.name}</div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
