import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Pagination } from "@/components/shared/Pagination";
import { DeleteTeacherPaymentButton } from "./DeleteTeacherPaymentButton";
import { formatCurrency, formatDate } from "@/lib/utils";

const PER_PAGE = 15;

interface Props {
  searchParams: Promise<{ page?: string }>;
}

export default async function TeacherPaymentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);

  const [payments, total, totalPaid] = await Promise.all([
    prisma.teacherPayment.findMany({
      include: { teacher: { include: { user: true } } },
      take: PER_PAGE,
      skip: (page - 1) * PER_PAGE,
      orderBy: { paymentDate: "desc" },
    }),
    prisma.teacherPayment.count(),
    prisma.teacherPayment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      PAID: "bg-green-50 text-green-700",
      PENDING: "bg-amber-50 text-amber-700",
      OVERDUE: "bg-red-50 text-red-700",
    };
    return map[s] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">Teacher Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Total paid out: <span className="font-semibold text-red-700">{formatCurrency(Number(totalPaid._sum.amount || 0))}</span></p>
        </div>
        <Link href="/admin/teacher-payments/create" className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm">
          <Plus className="w-4 h-4" /> Record Payment
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{p.teacher.user.name}</div>
                    <div className="text-xs text-gray-500">{p.teacher.specialization}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(Number(p.amount))}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(p.paymentDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.paymentMethod.replace("_", " ")}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(p.status)}`}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <DeleteTeacherPaymentButton id={p.id} label={`${p.teacher.user.name} — ${formatCurrency(Number(p.amount))}`} />
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No teacher payments recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-4">
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      </div>
    </div>
  );
}
