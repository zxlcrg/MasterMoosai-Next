import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";

async function getDashboardData() {
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [totalStudents, totalTeachers, totalCourses, activeEnrollments, monthlyRevenue, recentEnrollments] =
    await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.course.count(),
      prisma.enrollment.count({ where: { status: "ACTIVE" } }),
      prisma.payment.aggregate({
        where: { status: "PAID", month: currentMonth },
        _sum: { amount: true },
      }),
      prisma.enrollment.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { student: { include: { user: true } }, course: true },
      }),
    ]);

  return {
    stats: {
      totalStudents,
      totalTeachers,
      totalCourses,
      activeEnrollments,
      monthlyRevenue: Number(monthlyRevenue._sum.amount || 0),
    },
    recentEnrollments,
  };
}

export default async function DashboardPage() {
  const session = await auth();
  const { stats, recentEnrollments } = await getDashboardData();

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20"></div>
        <div className="relative">
          <h2 className="text-2xl font-bold mb-1">Welcome back, {session?.user?.name} 👋</h2>
          <p className="text-indigo-200">{currentDate}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Students" value={stats.totalStudents} bg="bg-indigo-50" tx="text-indigo-600" />
        <StatCard label="Teachers" value={stats.totalTeachers} bg="bg-emerald-50" tx="text-emerald-600" />
        <StatCard label="Courses" value={stats.totalCourses} bg="bg-amber-50" tx="text-amber-600" />
        <StatCard label="Enrollments" value={stats.activeEnrollments} bg="bg-blue-50" tx="text-blue-600" />
        <StatCard label="Revenue" value={formatCurrency(stats.monthlyRevenue)} bg="bg-green-50" tx="text-green-600" valueClass="text-green-600" />
      </div>

      {/* Recent Enrollments + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Recent Enrollments</h3>
            <Link href="/admin/enrollments" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentEnrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{e.student.user.name}</td>
                    <td className="px-6 py-3.5 text-sm text-gray-500">{e.course.title}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
                        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-green-500"></span>
                        {e.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-500">{formatDate(e.enrolledAt)}</td>
                  </tr>
                ))}
                {recentEnrollments.length === 0 && (
                  <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No recent enrollments</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-3 space-y-1">
            {[
              { label: "Add Student", href: "/admin/students/create" },
              { label: "Add Course", href: "/admin/courses/create" },
              { label: "Record Payment", href: "/admin/payments/create" },
              { label: "New Enrollment", href: "/admin/enrollments/create" },
              { label: "View Reports", href: "/admin/reports" },
            ].map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex items-center px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
              >
                <span className="flex-1">{a.label}</span>
                <span>→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, bg, tx, valueClass }: { label: string; value: string | number; bg: string; tx: string; valueClass?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
          <div className={`w-6 h-6 rounded ${tx}`}></div>
        </div>
        <div className="min-w-0">
          <p className="text-sm text-gray-500 truncate">{label}</p>
          <p className={`text-2xl font-bold ${valueClass || "text-gray-900"}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}
