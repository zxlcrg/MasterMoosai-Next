import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { TrendingUp, TrendingDown, Users, BookOpen, AlertCircle, CheckCircle, Wallet, Calendar } from "lucide-react";
import type { PaymentStatus } from "@prisma/client";
import { DatePicker } from "@/components/shared/DatePicker";

type Preset = "all" | "this-month" | "last-month" | "this-year" | "custom";

interface Range {
  from?: Date;
  to?: Date;
  label: string;
  preset: Preset;
  fromValue: string; // YYYY-MM-DD or ""
  toValue: string;
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}
function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

function resolveRange(params: { from?: string; to?: string; preset?: string }): Range {
  const now = new Date();
  const preset = (params.preset as Preset) || (params.from || params.to ? "custom" : "all");

  if (preset === "this-month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { from, to, label: `${now.toLocaleString("en-US", { month: "long", year: "numeric" })}`, preset, fromValue: ymd(from), toValue: ymd(to) };
  }
  if (preset === "last-month") {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const to = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { from, to, label: `${from.toLocaleString("en-US", { month: "long", year: "numeric" })}`, preset, fromValue: ymd(from), toValue: ymd(to) };
  }
  if (preset === "this-year") {
    const from = new Date(now.getFullYear(), 0, 1);
    const to = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    return { from, to, label: `${now.getFullYear()}`, preset, fromValue: ymd(from), toValue: ymd(to) };
  }
  if (preset === "custom") {
    const from = params.from ? startOfDay(new Date(params.from)) : undefined;
    const to = params.to ? endOfDay(new Date(params.to)) : undefined;
    let label = "Custom range";
    if (from && to) label = `${formatDate(from)} – ${formatDate(to)}`;
    else if (from) label = `From ${formatDate(from)}`;
    else if (to) label = `Until ${formatDate(to)}`;
    return { from, to, label, preset, fromValue: params.from || "", toValue: params.to || "" };
  }
  return { label: "All time", preset: "all", fromValue: "", toValue: "" };
}

function dateFilter(field: string, range: Range) {
  if (!range.from && !range.to) return undefined;
  const filter: any = {};
  if (range.from) filter.gte = range.from;
  if (range.to) filter.lte = range.to;
  return { [field]: filter };
}

interface Props {
  searchParams: Promise<{ from?: string; to?: string; preset?: string }>;
}

export default async function ReportsPage({ searchParams }: Props) {
  const params = await searchParams;
  const range = resolveRange(params);

  const paymentDateFilter = dateFilter("paymentDate", range);
  const expenseDateFilter = dateFilter("expenseDate", range);
  const enrolledAtFilter = dateFilter("enrolledAt", range);

  const paymentWhere = (status: PaymentStatus) => ({ status, ...(paymentDateFilter || {}) });
  const expenseWhere = expenseDateFilter || {};
  const enrollmentWhere = enrolledAtFilter || {};

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
    prisma.payment.aggregate({ where: paymentWhere("PAID"), _sum: { amount: true } }),
    prisma.teacherPayment.aggregate({ where: paymentWhere("PAID"), _sum: { amount: true } }),
    prisma.expense.aggregate({ where: expenseWhere, _sum: { amount: true }, _count: { _all: true } }),
    prisma.payment.aggregate({ where: paymentWhere("PENDING"), _sum: { amount: true }, _count: { _all: true } }),
    prisma.payment.aggregate({ where: paymentWhere("OVERDUE"), _sum: { amount: true }, _count: { _all: true } }),
    prisma.enrollment.groupBy({ by: ["status"], where: enrollmentWhere, _count: { _all: true } }),
    prisma.expense.groupBy({
      by: ["categoryId"],
      where: expenseWhere,
      _sum: { amount: true },
      _count: { _all: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
    prisma.expenseCategory.findMany({ select: { id: true, name: true, icon: true, color: true } }),
    prisma.course.findMany({
      include: {
        _count: {
          select: enrolledAtFilter
            ? { enrollments: { where: enrolledAtFilter } }
            : { enrollments: true },
        },
        teacher: { include: { user: true } },
      },
      orderBy: { enrollments: { _count: "desc" } },
      take: 5,
    }),
  ]);

  const revenue = Number(totalRevenue._sum?.amount || 0);
  const paidOut = Number(totalPaidOut._sum?.amount || 0);
  const expenses = Number(totalExpenses._sum?.amount || 0);
  const netProfit = revenue - paidOut - expenses;
  const categoryById = new Map(expenseCategories.map((c) => [c.id, c]));
  const expensesBreakdown = expensesByCategory.map((e) => ({
    category: categoryById.get(e.categoryId),
    amount: Number(e._sum.amount || 0),
    count: e._count._all,
    pct: expenses > 0 ? (Number(e._sum.amount || 0) / expenses) * 100 : 0,
  }));

  const presetChip = (preset: Preset, label: string) => (
    <Link
      href={preset === "all" ? "/admin/reports" : `/admin/reports?preset=${preset}`}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
        range.preset === preset
          ? "bg-indigo-600 text-white border-indigo-600"
          : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">Reports</h1>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> {range.label}
          </p>
        </div>
      </div>

      {/* Date range filter */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {presetChip("all", "All time")}
          {presetChip("this-month", "This month")}
          {presetChip("last-month", "Last month")}
          {presetChip("this-year", "This year")}

          <form method="GET" className="flex flex-wrap items-end gap-2 ml-auto">
            <input type="hidden" name="preset" value="custom" />
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
              <DatePicker name="from" defaultValue={range.fromValue} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <DatePicker name="to" defaultValue={range.toValue} />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
            >
              Apply
            </button>
          </form>
        </div>
      </div>

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
          <p className="text-xs text-gray-400 mt-1">{totalExpenses._count._all} expense{totalExpenses._count._all === 1 ? "" : "s"} recorded</p>
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
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(Number(pendingPayments._sum?.amount || 0))}</p>
          <p className="text-xs text-gray-400 mt-1">{pendingPayments._count._all} payments awaiting</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm font-medium text-gray-500">Overdue Payments</p>
          </div>
          <p className="text-2xl font-bold text-red-700">{formatCurrency(Number(overduePayments._sum?.amount || 0))}</p>
          <p className="text-xs text-gray-400 mt-1">{overduePayments._count._all} payments overdue</p>
        </div>
      </div>

      {/* Enrollment status breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-gray-400" /> Enrollment Status
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(["PENDING", "ACTIVE", "COMPLETED", "DROPPED"] as const).map((status) => {
            const item = enrollmentsByStatus.find((e) => e.status === status);
            const count = item?._count._all || 0;
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
          <p className="text-sm text-gray-400 text-center py-4">No expenses in this range.</p>
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
