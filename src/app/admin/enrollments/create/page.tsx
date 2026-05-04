import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { createEnrollment } from "../actions";
import { formatCurrency } from "@/lib/utils";

export default async function CreateEnrollmentPage() {
  const [students, courses] = await Promise.all([
    prisma.student.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } }),
    prisma.course.findMany({ where: { status: "ACTIVE" }, orderBy: { title: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <Link href="/admin/enrollments" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Enrollments
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">New Enrollment</h1>
      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
        <form action={createEnrollment as any} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Student</label>
            <select name="studentId" required className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
              <option value="">— Select student —</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.user.name} ({s.user.email})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Course</label>
            <select name="courseId" required className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
              <option value="">— Select course —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title} — {formatCurrency(Number(c.feeAmount))} ({c.durationWeeks} wks)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select name="status" defaultValue="PENDING" className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
              <option value="PENDING">Pending</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="DROPPED">Dropped</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Link href="/admin/enrollments" className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</Link>
            <button type="submit" className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Create Enrollment</button>
          </div>
        </form>
      </div>
    </div>
  );
}
