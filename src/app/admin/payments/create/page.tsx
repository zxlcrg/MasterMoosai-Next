import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createPayment } from "../actions";
import { formatCurrency } from "@/lib/utils";

export default async function CreatePaymentPage() {
  const enrollments = await prisma.enrollment.findMany({
    include: { student: { include: { user: true } }, course: true },
    where: { status: { in: ["ACTIVE", "PENDING"] } },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const currentMonthIndex = now.getMonth();
  const currentYear = now.getFullYear();
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const yearOptions = Array.from({ length: 7 }, (_, i) => currentYear - 3 + i);


  return (
    <div className="space-y-6">
      <Link href="/admin/payments" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Payments
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">Record Payment</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
        <form action={createPayment as any} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Enrollment</label>
            <select name="enrollmentId" required className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
              <option value="">— Select enrollment —</option>
              {enrollments.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.student.user.name} → {e.course.title} ({formatCurrency(Number(e.course.feeAmount))})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (BDT)</label>
              <input name="amount" type="number" step="0.01" min="0" required className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment Date</label>
              <input name="paymentDate" type="date" defaultValue={today} required className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Month</label>
              <select name="monthName" defaultValue={monthNames[currentMonthIndex]} required className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                {monthNames.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
              <select name="year" defaultValue={String(currentYear)} required className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Method</label>
              <select name="paymentMethod" defaultValue="CASH" className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="ONLINE">Online</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select name="status" defaultValue="PAID" className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reference # <span className="text-gray-400">(optional)</span></label>
              <input name="referenceNumber" type="text" className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes <span className="text-gray-400">(optional)</span></label>
            <textarea name="notes" rows={3} className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Link href="/admin/payments" className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</Link>
            <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Record Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
}
