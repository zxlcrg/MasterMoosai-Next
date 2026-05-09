import Link from "next/link";
import { ChevronLeft, Lock } from "lucide-react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateEnrollment } from "../../actions";
import { formatCurrency } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditEnrollmentPage({ params }: Props) {
  const { id } = await params;
  const enrollmentId = parseInt(id, 10);
  if (Number.isNaN(enrollmentId)) notFound();

  const [enrollment, students, courses] = await Promise.all([
    prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: { include: { user: true } },
        course: true,
        _count: { select: { payments: true } },
      },
    }),
    prisma.student.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } }),
    prisma.course.findMany({ orderBy: { title: "asc" } }),
  ]);
  if (!enrollment) notFound();

  const updateAction = updateEnrollment.bind(null, enrollmentId);
  const paymentCount = enrollment._count.payments;
  const reassignLocked = paymentCount > 0;

  const enrolledAtValue = enrollment.enrolledAt.toISOString().slice(0, 10);
  const completedAtValue = enrollment.completedAt
    ? enrollment.completedAt.toISOString().slice(0, 10)
    : "";

  return (
    <div className="space-y-6">
      <Link href="/admin/enrollments" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Enrollments
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 font-sans">
        Edit Enrollment: {enrollment.student.user.name} → {enrollment.course.title}
      </h1>

      {reassignLocked && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 max-w-2xl flex items-start gap-3">
          <Lock className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-medium">Student and course are locked.</p>
            <p className="text-amber-700 mt-0.5">
              {paymentCount} payment{paymentCount === 1 ? "" : "s"} are linked to this enrollment.
              To reassign, delete the payments or create a new enrollment.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 p-6 max-w-2xl">
        <form action={updateAction as any} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Student</label>
            <select
              name="studentId"
              required
              defaultValue={enrollment.studentId}
              disabled={reassignLocked}
              className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-50 disabled:text-gray-500"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user.name} ({s.user.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Course</label>
            <select
              name="courseId"
              required
              defaultValue={enrollment.courseId}
              disabled={reassignLocked}
              className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-gray-50 disabled:text-gray-500"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} — {formatCurrency(Number(c.feeAmount))} ({c.durationWeeks} wks)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select
                name="status"
                defaultValue={enrollment.status}
                className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="DROPPED">Dropped</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Enrolled On</label>
              <input
                name="enrolledAt"
                type="date"
                required
                defaultValue={enrolledAtValue}
                className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Completed On <span className="text-gray-400">(optional)</span>
              </label>
              <input
                name="completedAt"
                type="date"
                defaultValue={completedAtValue}
                className="block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
              <p className="text-xs text-gray-400 mt-1">Auto-set when status is Completed and left blank.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <Link
              href="/admin/enrollments"
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Update Enrollment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
