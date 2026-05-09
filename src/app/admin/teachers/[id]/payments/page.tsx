import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, FileText, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TeacherPaymentHistoryPage({ params }: Props) {
  const { id } = await params;
  const teacherId = parseInt(id, 10);
  if (Number.isNaN(teacherId)) notFound();

  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: {
      user: true,
      teacherPayments: { orderBy: { paymentDate: "desc" } },
    },
  });
  if (!teacher) notFound();

  const totalPaid = teacher.teacherPayments
    .filter((p) => p.status === "PAID")
    .reduce((s, p) => s + Number(p.amount), 0);
  const pendingCount = teacher.teacherPayments.filter((p) => p.status !== "PAID").length;

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
      <Link href="/admin/teachers" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Teachers
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-sans">{teacher.user.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {teacher.specialization}
            {teacher.user.phone ? ` · ${teacher.user.phone}` : ""}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {teacher.teacherPayments.length} payout{teacher.teacherPayments.length === 1 ? "" : "s"} ·{" "}
            Total paid: <span className="font-semibold text-red-700">{formatCurrency(totalPaid)}</span>
            {pendingCount > 0 && (
              <> · <span className="text-amber-700 font-semibold">{pendingCount} pending</span></>
            )}
          </p>
        </div>
        <Link
          href="/admin/teacher-payments/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Record Payment
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Voucher</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teacher.teacherPayments.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(Number(p.amount))}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(p.paymentDate)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.paymentMethod.replace("_", " ")}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.referenceNumber || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(p.status)}`}>{p.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <Link
                      href={`/admin/teacher-payments/${p.id}/invoice`}
                      title="View voucher"
                      className="p-2 inline-flex rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {teacher.teacherPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                    No payments recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
