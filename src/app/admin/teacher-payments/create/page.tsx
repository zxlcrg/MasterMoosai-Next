import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createTeacherPayment } from "../actions";

export default async function CreateTeacherPaymentPage() {
  const teachers = await prisma.teacher.findMany({
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const currentMonth = `${now.toLocaleString("en-US", { month: "long" })} ${now.getFullYear()}`;

  return (
    <div className="space-y-6">
      <Link href="/admin/teacher-payments" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Teacher Payments
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">Record Teacher Payment</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
        <form action={createTeacherPayment as any} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Teacher</label>
            <select name="teacherId" required className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
              <option value="">— Select teacher —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.user.name} — {t.specialization}</option>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Month</label>
              <input name="month" type="text" defaultValue={currentMonth} required className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
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
            <Link href="/admin/teacher-payments" className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</Link>
            <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Record Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
}
