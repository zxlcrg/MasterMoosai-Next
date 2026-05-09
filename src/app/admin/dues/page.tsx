import Link from "next/link";
import { AlertTriangle, FileText, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

function monthsBetweenInclusive(from: Date, to: Date): number {
  // Inclusive month count: enrolling May 2026, current May 2026 → 1
  const months =
    (to.getFullYear() - from.getFullYear()) * 12 +
    (to.getMonth() - from.getMonth()) +
    1;
  return Math.max(0, months);
}

export default async function DuesPage() {
  const now = new Date();

  // ---------- Student dues (computed) ----------
  const activeEnrollments = await prisma.enrollment.findMany({
    where: { status: "ACTIVE" },
    include: {
      student: { include: { user: true } },
      course: true,
      payments: { where: { status: "PAID" }, select: { month: true } },
    },
  });

  type StudentRow = {
    studentId: number;
    studentName: string;
    studentEmail: string;
    courseTitle: string;
    monthlyFee: number;
    expectedMonths: number;
    paidMonths: number;
    duesMonths: number;
    duesAmount: number;
  };

  const studentRows: StudentRow[] = activeEnrollments
    .map((e) => {
      const expected = monthsBetweenInclusive(new Date(e.enrolledAt), now);
      const paid = new Set(e.payments.map((p) => p.month)).size;
      const duesMonths = Math.max(0, expected - paid);
      const monthlyFee = Number(e.course.feeAmount);
      return {
        studentId: e.studentId,
        studentName: e.student.user.name,
        studentEmail: e.student.user.email,
        courseTitle: e.course.title,
        monthlyFee,
        expectedMonths: expected,
        paidMonths: paid,
        duesMonths,
        duesAmount: duesMonths * monthlyFee,
      };
    })
    .filter((r) => r.duesMonths > 0)
    .sort((a, b) => b.duesAmount - a.duesAmount);

  const studentDuesTotal = studentRows.reduce((s, r) => s + r.duesAmount, 0);

  // ---------- Teacher dues (status-based) ----------
  const teacherDuesGrouped = await prisma.teacherPayment.groupBy({
    by: ["teacherId"],
    where: { status: { in: ["PENDING", "OVERDUE"] } },
    _sum: { amount: true },
    _count: true,
    orderBy: { _sum: { amount: "desc" } },
  });

  const teacherIds = teacherDuesGrouped.map((g) => g.teacherId);
  const teachers = teacherIds.length
    ? await prisma.teacher.findMany({
        where: { id: { in: teacherIds } },
        include: { user: true },
      })
    : [];
  const teacherById = new Map(teachers.map((t) => [t.id, t]));

  const teacherRows = teacherDuesGrouped.map((g) => {
    const t = teacherById.get(g.teacherId);
    return {
      teacherId: g.teacherId,
      teacherName: t?.user.name ?? "(unknown)",
      specialization: t?.specialization ?? "",
      amount: Number(g._sum.amount || 0),
      count: g._count,
    };
  });

  const teacherDuesTotal = teacherRows.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-sans">Payment Dues</h1>
        <p className="text-sm text-gray-500 mt-1">
          Outstanding student fees (computed from enrollment age) and pending teacher payouts.
        </p>
      </div>

      {/* Summary band */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-amber-100 p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500">Student dues</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{formatCurrency(studentDuesTotal)}</p>
          <p className="text-xs text-gray-400 mt-1">{studentRows.length} enrollment{studentRows.length === 1 ? "" : "s"} behind</p>
        </div>
        <div className="bg-white rounded-xl border border-red-100 p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500">Teacher dues</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{formatCurrency(teacherDuesTotal)}</p>
          <p className="text-xs text-gray-400 mt-1">{teacherRows.length} teacher{teacherRows.length === 1 ? "" : "s"} unpaid</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5">
          <p className="text-xs uppercase tracking-wider text-gray-500">Combined</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(studentDuesTotal + teacherDuesTotal)}</p>
          <p className="text-xs text-gray-400 mt-1">Total outstanding</p>
        </div>
      </div>

      {/* Student dues */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> Student Dues
          </h2>
          <Link
            href="/admin/payments/create"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-3.5 h-3.5" /> Record Payment
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Fee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid / Expected</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dues</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {studentRows.map((r) => (
                <tr key={`${r.studentId}-${r.courseTitle}`} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{r.studentName}</div>
                    <div className="text-xs text-gray-500">{r.studentEmail}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{r.courseTitle}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatCurrency(r.monthlyFee)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {r.paidMonths} / {r.expectedMonths}
                    <span className="text-gray-400 text-xs ml-1">months</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-amber-700">{formatCurrency(r.duesAmount)}</div>
                    <div className="text-xs text-gray-400">{r.duesMonths} month{r.duesMonths === 1 ? "" : "s"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      href={`/admin/students/${r.studentId}/payments`}
                      title="View history"
                      className="p-2 inline-flex rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <FileText className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {studentRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No student dues. All active enrollments are paid up to the current month.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher dues */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" /> Teacher Dues
          </h2>
          <Link
            href="/admin/teacher-payments/create"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-3.5 h-3.5" /> Record Payment
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unpaid Entries</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dues</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teacherRows.map((r) => (
                <tr key={r.teacherId} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.teacherName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.specialization}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-700">
                    {formatCurrency(r.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      href={`/admin/teachers/${r.teacherId}/payments`}
                      title="View history"
                      className="p-2 inline-flex rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <FileText className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {teacherRows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No teacher dues. All teacher payouts are settled.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 text-xs text-gray-400">
          Teacher dues are based on payment entries explicitly marked PENDING or OVERDUE. Add a teacher salary field later for computed dues.
        </div>
      </div>
    </div>
  );
}
