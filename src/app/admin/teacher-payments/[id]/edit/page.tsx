import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { updateTeacherPayment } from "../../actions";
import { DatePicker } from "@/components/shared/DatePicker";

interface Props {
  params: Promise<{ id: string }>;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

function parseStoredMonth(raw: string): { monthName: string; year: number } {
  const match = /^(\w+)\s+(\d{4})$/.exec(raw);
  if (match && (MONTH_NAMES as readonly string[]).includes(match[1])) {
    return { monthName: match[1], year: Number(match[2]) };
  }
  const now = new Date();
  return { monthName: MONTH_NAMES[now.getMonth()], year: now.getFullYear() };
}

export default async function EditTeacherPaymentPage({ params }: Props) {
  const { id } = await params;
  const paymentId = parseInt(id, 10);
  if (Number.isNaN(paymentId)) notFound();

  const [payment, teachers] = await Promise.all([
    prisma.teacherPayment.findUnique({
      where: { id: paymentId },
      include: { teacher: { include: { user: true } } },
    }),
    prisma.teacher.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } }),
  ]);
  if (!payment) notFound();

  const updateAction = updateTeacherPayment.bind(null, paymentId);
  const stored = parseStoredMonth(payment.month);

  const yearOptions = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i);
  if (!yearOptions.includes(stored.year)) yearOptions.push(stored.year);
  yearOptions.sort((a, b) => a - b);

  const paymentDateValue = payment.paymentDate.toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <Link href="/admin/teacher-payments" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Teacher Payments
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">
        Edit Teacher Payment: {payment.teacher.user.name}
      </h1>

      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
        <form action={updateAction as any} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Teacher</label>
            <select
              name="teacherId"
              required
              defaultValue={payment.teacherId}
              className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.user.name} — {t.specialization}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (BDT)</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                required
                defaultValue={Number(payment.amount)}
                className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Date</label>
              <DatePicker name="paymentDate" required defaultValue={paymentDateValue} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Month</label>
              <select
                name="monthName"
                required
                defaultValue={stored.monthName}
                className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                {MONTH_NAMES.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
              <select
                name="year"
                required
                defaultValue={String(stored.year)}
                className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Method</label>
              <select
                name="paymentMethod"
                defaultValue={payment.paymentMethod}
                className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="ONLINE">Online</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                name="status"
                defaultValue={payment.status}
                className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Reference # <span className="text-gray-400">(optional)</span>
              </label>
              <input
                name="referenceNumber"
                type="text"
                defaultValue={payment.referenceNumber || ""}
                className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={payment.notes || ""}
              className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Link
              href="/admin/teacher-payments"
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Update Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
