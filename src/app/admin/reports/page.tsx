import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Users, BookOpen, AlertCircle, CheckCircle, Wallet } from "lucide-react";

export default async function ReportsPage() {
  const [
    totalRevenue,
    totalPaidOut,
    totalExpenses,
    pendingPayments,
    overduePayments,
    enrollmentsByStatus,
    expensesByCategory,
    expenseCategories,
    topCourses,
  ] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.teacherPayment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.expense.aggregate({ _sum: { amount: true }, _count: true }),
    prisma.payment.aggregate({ where: { status: "PENDING" }, _sum: { amount: true }, _count: true }),
    prisma.payment.aggregate({ where: { status: "OVERDUE" }, _sum: { amount: true }, _count: true }),
    prisma.enrollment.groupBy({ by: ["status"], _count: true }),
    prisma.expense.groupBy({
      by: ["categoryId"],
      _sum: { amount: true },
      _count: true,
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.expenseCategory.findMany({ select: { id: true, name: true, icon: true, color: true } }),
    prisma.course.findMany({
      include: { _count: { select: { enrollments: true } }, teacher: { include: { user: true } } },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
    }),
  ]);

  const revenue = Number(totalRevenue._sum.amount || 0);
  const paidOut = Number(totalPaidOut._sum.amount || 0);
  const expenses = Number(totalExpenses._sum.amount || 0);
  const netProfit = revenue - paidOut - expenses;
  const categoryById = new Map(expenseCategories.map((c) => [c.id, c]));
  const expensesBreakdown = expensesByCategory.map((e) => ({
    category: categoryById.get(e.categoryId),
    amount: Number(e._sum.amount || 0),
    count: e._count,
    pct: expenses > 0 ? (Number(e._sum.amount || 0) / expenses) * 100 : 0,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 font-sans">Reports</h1>

      {/* Financial overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(revenue)}</p>
          <p className="text-xs text-gray-400 mt-1">From student payments</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Teacher Payouts</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(paidOut)}</p>
          <p className="text-xs text-gray-400 mt-1">Paid to instructors</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Operating Expenses</p>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(expenses)}</p>
          <p className="text-xs text-gray-400 mt-1">{totalExpenses._count} expense{totalExpenses._count === 1 ? "" : "s"} recorded</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Net Profit</p>
          </div>
          <p className={`text-3xl font-bold ${netProfit >= 0 ? "text-green-700" : "text-red-700"}`}>{formatCurrency(netProfit)}</p>
          <p className="text-xs text-gray-400 mt-1">Revenue − Payouts − Expenses</p>
        </div>
      </div>

      {/* Outstanding payments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Pending Payments</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(Number(pendingPayments._sum.amount || 0))}</p>
          <p className="text-xs text-gray-400 mt-1">{pendingPayments._count} payments awaiting</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Overdue Payments</p>
          </div>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(Number(overduePayments._sum.amount || 0))}</p>
          <p className="text-xs text-gray-400 mt-1">{overduePayments._count} payments overdue</p>
        </div>
      </div>

      {/* Enrollment status breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" /> Enrollment Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {["PENDING", "ACTIVE", "COMPLETED", "DROPPED"].map((status) => {
            const item = enrollmentsByStatus.find((e) => e.status === status);
            const count = item?._count || 0;
            const colors: Record<string, string> = {
              PENDING: "bg-amber-50 text-amber-700",
              ACTIVE: "bg-green-50 text-green-700",
              COMPLETED: "bg-blue-50 text-blue-700",
              DROPPED: "bg-red-50 text-red-700",
            };
            return (
              <div key={status} className={`rounded-lg p-4 ${colors[status]}`}>
                <p className="text-xs font-medium uppercase mb-1">{status}</p>
                <p className="text-2xl font-bold">{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expenses by category */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-gray-400" /> Expenses by Category
        </h2>
        {expensesBreakdown.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No expenses recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {expensesBreakdown.map((row) => {
              const cat = row.category;
              const color = cat?.color || "#f97316";
              return (
                <div key={cat?.id ?? "unknown"} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-700">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      {cat?.icon ? `${cat.icon} ` : ""}{cat?.name || "Uncategorised"}
                      <span className="text-gray-400 text-xs">· {row.count} entry{row.count === 1 ? "" : "ies"}</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(row.amount)}
                      <span className="text-gray-400 font-normal text-xs ml-2">{row.pct.toFixed(1)}%</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${row.pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top courses */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-gray-400" /> Top 5 Courses by Enrollment
        </h2>
        <div className="space-y-3">
          {topCourses.map((c, i) => (
            <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0 border-gray-100">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.title}</p>
                  <p className="text-xs text-gray-500">{c.teacher?.user.name || "No teacher"} • {formatCurrency(Number(c.feeAmount))}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-700">{c._count.enrollments} enrolled</p>
            </div>
          ))}
          {topCourses.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No courses yet.</p>}
        </div>
      </div>
    </div>
  );
}
